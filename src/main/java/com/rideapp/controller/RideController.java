package com.rideapp.controller;

import com.rideapp.entity.Ride;
import com.rideapp.repository.MultiRegionRideRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin
public class RideController {

    private final MultiRegionRideRepository repo;

    public RideController(MultiRegionRideRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Ride> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public String create(@RequestBody Ride ride) {
        return "Use region-specific endpoint";
    }
}