package com.rideapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "driver_id")
    private Long driverId;

    private String pickup;
    private String dropoff;
    private String status;
    private String region;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getDriverId() { return driverId; }
    public String getPickup() { return pickup; }
    public String getDropoff() { return dropoff; }
    public String getStatus() { return status; }
    public String getRegion() { return region; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ✅ Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public void setPickup(String pickup) { this.pickup = pickup; }
    public void setDropoff(String dropoff) { this.dropoff = dropoff; }
    public void setStatus(String status) { this.status = status; }
    public void setRegion(String region) { this.region = region; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}