package com.rideapp.service;

import com.rideapp.routing.FailoverDataSourceManager;
import com.rideapp.routing.Region;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/**
 * Service đo latency thực tế giữa:
 *  - Distributed: routing qua FailoverDataSourceManager (có region resolution + failover check)
 *  - Single DB   : kết nối thẳng tới một DataSource (southPrimaryDS) – mô phỏng DB tập trung
 */
@Service
public class LatencyBenchmarkService {

    private final FailoverDataSourceManager failoverMgr;
    private final DataSource singleDS; // southPrimaryDS – đại diện cho DB tập trung

    private static final String READ_SQL =
            "SELECT id, user_id, pickup, dropoff, status FROM rides LIMIT 50";
    private static final String WRITE_SQL =
            "INSERT INTO rides (user_id, driver_id, pickup, dropoff, price, status, region) " +
            "VALUES (?,?,?,?,?,?,?) RETURNING id";
    private static final String DELETE_SQL = "DELETE FROM rides WHERE id = ?";

    public LatencyBenchmarkService(
            FailoverDataSourceManager failoverMgr,
            @Qualifier("southPrimaryDS") DataSource southPrimaryDS) {
        this.failoverMgr = failoverMgr;
        this.singleDS = southPrimaryDS;
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    /**
     * Chạy toàn bộ benchmark: READ + WRITE, cả hai chế độ, warmup + measure.
     *
     * @param iterations số lần lặp cho mỗi kịch bản
     */
    public Map<String, Object> runFullBenchmark(int iterations) {
        int warmup = Math.max(5, iterations / 10);

        // ── READ benchmarks ──────────────────────────────────────────────────
        List<Long> distReadNorth = benchmarkDistributedRead(Region.NORTH, warmup, iterations);
        List<Long> distReadSouth = benchmarkDistributedRead(Region.SOUTH, warmup, iterations);
        List<Long> singleRead    = benchmarkSingleRead(warmup, iterations);

        // ── WRITE benchmarks ─────────────────────────────────────────────────
        List<Long> distWriteNorth = benchmarkDistributedWrite(Region.NORTH, warmup, iterations);
        List<Long> distWriteSouth = benchmarkDistributedWrite(Region.SOUTH, warmup, iterations);
        List<Long> singleWrite    = benchmarkSingleWrite(warmup, iterations);

        // ── Assemble result ──────────────────────────────────────────────────
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("iterations", iterations);
        result.put("warmupRounds", warmup);
        result.put("timestamp", System.currentTimeMillis());

        result.put("read", buildSection(
                Map.of(
                    "distributed_north", distReadNorth,
                    "distributed_south", distReadSouth,
                    "single_db",         singleRead
                )
        ));

        result.put("write", buildSection(
                Map.of(
                    "distributed_north", distWriteNorth,
                    "distributed_south", distWriteSouth,
                    "single_db",         singleWrite
                )
        ));

        result.put("summary", buildComparison(distReadNorth, distReadSouth, singleRead,
                                               distWriteNorth, distWriteSouth, singleWrite));
        return result;
    }

    // ─── Distributed READ ────────────────────────────────────────────────────

    private List<Long> benchmarkDistributedRead(Region region, int warmup, int iterations) {
        // Warmup
        for (int i = 0; i < warmup; i++) {
            try {
                runDistributedRead(region);
            } catch (Exception ignored) {}
        }
        // Measure
        List<Long> samples = new ArrayList<>(iterations);
        for (int i = 0; i < iterations; i++) {
            long t0 = System.nanoTime();
            try {
                runDistributedRead(region);
            } catch (Exception e) {
                samples.add(-1L); // mark error
                continue;
            }
            samples.add((System.nanoTime() - t0) / 1_000); // µs
        }
        return samples;
    }

    private void runDistributedRead(Region region) throws SQLException {
        try (Connection conn = failoverMgr.getConnection(region, true);
             PreparedStatement ps = conn.prepareStatement(READ_SQL);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) { rs.getLong(1); }
        }
    }

    // ─── Single DB READ ──────────────────────────────────────────────────────

    private List<Long> benchmarkSingleRead(int warmup, int iterations) {
        for (int i = 0; i < warmup; i++) {
            try { runSingleRead(); } catch (Exception ignored) {}
        }
        List<Long> samples = new ArrayList<>(iterations);
        for (int i = 0; i < iterations; i++) {
            long t0 = System.nanoTime();
            try {
                runSingleRead();
            } catch (Exception e) {
                samples.add(-1L);
                continue;
            }
            samples.add((System.nanoTime() - t0) / 1_000);
        }
        return samples;
    }

    private void runSingleRead() throws SQLException {
        try (Connection conn = singleDS.getConnection();
             PreparedStatement ps = conn.prepareStatement(READ_SQL);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) { rs.getLong(1); }
        }
    }

    // ─── Distributed WRITE ───────────────────────────────────────────────────

    private List<Long> benchmarkDistributedWrite(Region region, int warmup, int iterations) {
        for (int i = 0; i < warmup; i++) {
            try { runDistributedWrite(region); } catch (Exception ignored) {}
        }
        List<Long> samples = new ArrayList<>(iterations);
        for (int i = 0; i < iterations; i++) {
            long t0 = System.nanoTime();
            Long insertedId = null;
            try {
                insertedId = runDistributedWrite(region);
            } catch (Exception e) {
                samples.add(-1L);
                continue;
            }
            samples.add((System.nanoTime() - t0) / 1_000);
            // Cleanup – best effort
            if (insertedId != null) {
                try { cleanupWrite(failoverMgr.getConnection(region, false), insertedId); }
                catch (Exception ignored) {}
            }
        }
        return samples;
    }

    private Long runDistributedWrite(Region region) throws SQLException {
        try (Connection conn = failoverMgr.getConnection(region, false);
             PreparedStatement ps = conn.prepareStatement(WRITE_SQL)) {
            ps.setLong(1, 1L);
            ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, "Benchmark Pickup");
            ps.setString(4, "Benchmark Dropoff");
            ps.setString(5, "0");
            ps.setString(6, "BENCHMARK");
            ps.setString(7, region.name());
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : null;
            }
        }
    }

    // ─── Single DB WRITE ─────────────────────────────────────────────────────

    private List<Long> benchmarkSingleWrite(int warmup, int iterations) {
        for (int i = 0; i < warmup; i++) {
            try { runSingleWrite(); } catch (Exception ignored) {}
        }
        List<Long> samples = new ArrayList<>(iterations);
        for (int i = 0; i < iterations; i++) {
            long t0 = System.nanoTime();
            Long insertedId = null;
            try {
                insertedId = runSingleWrite();
            } catch (Exception e) {
                samples.add(-1L);
                continue;
            }
            samples.add((System.nanoTime() - t0) / 1_000);
            if (insertedId != null) {
                try (Connection c = singleDS.getConnection()) { cleanupWrite(c, insertedId); }
                catch (Exception ignored) {}
            }
        }
        return samples;
    }

    private Long runSingleWrite() throws SQLException {
        try (Connection conn = singleDS.getConnection();
             PreparedStatement ps = conn.prepareStatement(WRITE_SQL)) {
            ps.setLong(1, 1L);
            ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, "Benchmark Pickup");
            ps.setString(4, "Benchmark Dropoff");
            ps.setString(5, "0");
            ps.setString(6, "BENCHMARK");
            ps.setString(7, "SOUTH");
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : null;
            }
        }
    }

    private void cleanupWrite(Connection conn, Long id) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(DELETE_SQL)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } finally {
            conn.close();
        }
    }

    // ─── Statistics helpers ───────────────────────────────────────────────────

    private Map<String, Object> buildSection(Map<String, List<Long>> groups) {
        Map<String, Object> section = new LinkedHashMap<>();
        for (Map.Entry<String, List<Long>> e : groups.entrySet()) {
            section.put(e.getKey(), stats(e.getValue()));
        }
        return section;
    }

    private Map<String, Object> stats(List<Long> raw) {
        List<Long> valid = raw.stream().filter(v -> v >= 0).sorted().toList();
        if (valid.isEmpty()) {
            return Map.of("error", "no valid samples", "rawSamples", raw);
        }
        double avg = valid.stream().mapToLong(Long::longValue).average().orElse(0);
        long min   = valid.get(0);
        long max   = valid.get(valid.size() - 1);
        long p50   = valid.get((int)(valid.size() * 0.50));
        long p95   = valid.get((int)(valid.size() * 0.95));
        long p99   = valid.get(Math.min((int)(valid.size() * 0.99), valid.size() - 1));
        int errors = (int)(raw.size() - valid.size());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("avgUs",    Math.round(avg));
        m.put("minUs",    min);
        m.put("maxUs",    max);
        m.put("p50Us",    p50);
        m.put("p95Us",    p95);
        m.put("p99Us",    p99);
        m.put("avgMs",    Math.round(avg / 1000.0));
        m.put("p50Ms",    p50 / 1000.0);
        m.put("p95Ms",    p95 / 1000.0);
        m.put("errorCount", errors);
        m.put("sampleCount", valid.size());
        m.put("rawSamplesUs", raw); // tất cả samples để vẽ biểu đồ
        return m;
    }

    private Map<String, Object> buildComparison(
            List<Long> distReadN, List<Long> distReadS, List<Long> singleRead,
            List<Long> distWriteN, List<Long> distWriteS, List<Long> singleWrite) {

        Map<String, Object> cmp = new LinkedHashMap<>();

        // Average latency overhead của distributed vs single
        double avgDistRead  = avgMs(distReadN, distReadS);
        double avgSingleRead = avgMs(singleRead);
        double avgDistWrite  = avgMs(distWriteN, distWriteS);
        double avgSingleWrite = avgMs(singleWrite);

        cmp.put("readOverheadMs",    round2(avgDistRead - avgSingleRead));
        cmp.put("readOverheadPct",   round2(((avgDistRead - avgSingleRead) / avgSingleRead) * 100));
        cmp.put("writeOverheadMs",   round2(avgDistWrite - avgSingleWrite));
        cmp.put("writeOverheadPct",  round2(((avgDistWrite - avgSingleWrite) / avgSingleWrite) * 100));
        cmp.put("avgDistributedReadMs",  round2(avgDistRead));
        cmp.put("avgSingleReadMs",       round2(avgSingleRead));
        cmp.put("avgDistributedWriteMs", round2(avgDistWrite));
        cmp.put("avgSingleWriteMs",      round2(avgSingleWrite));

        return cmp;
    }

    private double avgMs(List<Long>... lists) {
        long sum = 0; long count = 0;
        for (List<Long> list : lists) {
            for (Long v : list) {
                if (v >= 0) { sum += v; count++; }
            }
        }
        return count == 0 ? 0 : (sum / 1000.0) / count;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
