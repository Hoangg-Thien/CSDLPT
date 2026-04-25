package com.rideapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    private String phone;
    private String province;
    private String region;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ Getters
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getProvince() { return province; }
    public String getRegion() { return region; }
    public Boolean getIsAvailable() { return isAvailable; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ✅ Setters
    public void setId(Long id) { this.id = id; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setProvince(String province) { this.province = province; }
    public void setRegion(String region) { this.region = region; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}