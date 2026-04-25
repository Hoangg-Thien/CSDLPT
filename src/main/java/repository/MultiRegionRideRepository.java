package com.rideapp.repository;

import com.rideapp.entity.Ride;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class MultiRegionRideRepository {

    private final MultiRegionTemplate template;

    public MultiRegionRideRepository(MultiRegionTemplate template) {
        this.template = template;
    }

    public List<Ride> findAll() {
        return template.queryBoth("SELECT * FROM rides", (rs, i) -> {
            Ride r = new Ride();
            r.setId(rs.getLong("id"));
            r.setUserId(rs.getLong("user_id"));
            r.setDriverId(rs.getLong("driver_id"));
            r.setPickup(rs.getString("pickup"));
            r.setDropoff(rs.getString("dropoff"));
            r.setStatus(rs.getString("status"));
            r.setRegion(rs.getString("region"));
            return r;
        });
    }
}