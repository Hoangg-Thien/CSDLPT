package com.rideapp.controller;

import com.rideapp.entity.Ride;
import com.rideapp.repository.RideRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin
public class RideController {

    private final RideRepository repo;

    public RideController(RideRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Ride> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Ride create(@RequestBody Ride ride) {
        return repo.save(ride);
    }

    @PutMapping("/{id}")
    public Ride update(@PathVariable Long id, @RequestBody Ride ride) { // ✅ bỏ @PathVariable thừa
        ride.setId(id);
        return repo.save(ride);
    }
}