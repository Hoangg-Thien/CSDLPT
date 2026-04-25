package com.rideapp.controller;

import com.rideapp.entity.Driver;
import com.rideapp.repository.DriverRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin
public class DriverController {

    private final DriverRepository repo;

    public DriverController(DriverRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Driver> getAll() {
        return repo.findAll();
    }
}