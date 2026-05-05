package com.rideapp.repository;

import com.rideapp.routing.FailoverDataSourceManager;
import com.rideapp.routing.Region;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.stereotype.Component;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class MultiRegionTemplate {

    private final FailoverDataSourceManager failover;

    public MultiRegionTemplate(FailoverDataSourceManager failover) {
        this.failover = failover;
    }

    public <T> List<T> queryBoth(String sql, RowMapper<T> mapper) {
        List<T> result = new ArrayList<>();
        result.addAll(queryRegion(Region.SOUTH, sql, mapper));
        result.addAll(queryRegion(Region.NORTH, sql, mapper));
        return result;
    }

    private <T> List<T> queryRegion(Region region, String sql, RowMapper<T> mapper) {
        try (Connection conn = failover.getConnection(region, true)) {
            // Wrap single connection as DataSource so JdbcTemplate can use it
            SingleConnectionDataSource ds = new SingleConnectionDataSource(conn, true);
            return new JdbcTemplate(ds).query(sql, mapper);
        } catch (Exception e) {
            // Region fully offline — return empty list, don't crash the whole request
            return new ArrayList<>();
        }
    }

    public void updateByRegion(String region, String sql) {
        Region r = Region.valueOf(region.toUpperCase());
        try (Connection conn = failover.getConnection(r, false)) {
            SingleConnectionDataSource ds = new SingleConnectionDataSource(conn, true);
            new JdbcTemplate(ds).update(sql);
        } catch (SQLException e) {
            throw new RuntimeException("Không thể cập nhật vùng " + region, e);
        }
    }
}