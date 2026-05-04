package com.rideapp.controller;

import com.rideapp.entity.Ride;
import com.rideapp.repository.MultiRegionRideRepository;
import com.rideapp.service.RideService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin
public class RideController {

    private final MultiRegionRideRepository repo;
    private final RideService rideService;

    public RideController(MultiRegionRideRepository repo, RideService rideService) {
        this.repo = repo;
        this.rideService = rideService;
    }

    @GetMapping
    public List<Ride> getAll() {
        return repo.findAll();
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Ride>> getHistory(
            @PathVariable Long userId,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(defaultValue = "true") boolean isReadOnly) {
        try {
            List<Ride> rides = rideService.getHistory(userId, null, province, latitude, longitude, isReadOnly);
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookRide(
            @RequestBody Ride ride,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        try {
            Ride bookedRide = rideService.bookRideWithDriver(ride, false, province, latitude, longitude);
            return ResponseEntity.ok(bookedRide);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi đặt xe: " + e.getMessage());
        }
    }

    @PutMapping("/complete/{id}")
    public ResponseEntity<?> completeRide(@PathVariable Long id, @RequestParam(required = true) String region) {
        try {
            rideService.completeRide(id, region);
            return ResponseEntity.ok().body("{\"message\": \"Success\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}