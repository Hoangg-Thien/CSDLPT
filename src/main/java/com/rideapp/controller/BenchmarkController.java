package com.rideapp.controller;

import com.rideapp.service.LatencyBenchmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API để chạy benchmark latency distributed vs single DB.
 * GET /api/benchmark/latency?iterations=100
 */
@RestController
@RequestMapping("/api/benchmark")
@CrossOrigin
public class BenchmarkController {

    private final LatencyBenchmarkService benchmarkService;

    public BenchmarkController(LatencyBenchmarkService benchmarkService) {
        this.benchmarkService = benchmarkService;
    }

    /**
     * Chạy benchmark đầy đủ.
     * @param iterations số lần đo mỗi kịch bản (mặc định 50, tối đa 500)
     */
    @GetMapping("/latency")
    public ResponseEntity<Map<String, Object>> runBenchmark(
            @RequestParam(defaultValue = "50") int iterations) {
        if (iterations < 5)   iterations = 5;
        if (iterations > 500) iterations = 500;
        try {
            Map<String, Object> result = benchmarkService.runFullBenchmark(iterations);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** Health check nhanh */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "message", "Benchmark API is ready. Call /api/benchmark/latency?iterations=100"
        ));
    }
}
