package service;

import entity.Ride;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import routing.FailoverDataSourceManager;
import routing.Region;

@Service
public class RideService {

    private final FailoverDataSourceManager failoverDataSourceManager;

    public RideService(FailoverDataSourceManager failoverDataSourceManager) {
        this.failoverDataSourceManager = failoverDataSourceManager;
    }

    public Ride bookRide(Ride ride, boolean isReadOnly) {
        if (isReadOnly) {
            throw new IllegalArgumentException("bookRide does not allow read-only mode");
        }
        if (ride == null) {
            throw new IllegalArgumentException("ride must not be null");
        }

        Region region = parseRegion(ride.getRegion());

        String sql = """
                INSERT INTO rides (user_id, driver_id, pickup, dropoff, status, region)
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING id, created_at
                """;

        try (Connection connection = failoverDataSourceManager.getConnection(region, false);
                PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setLong(1, ride.getUserId());
            if (ride.getDriverId() == null) {
                statement.setNull(2, java.sql.Types.BIGINT);
            } else {
                statement.setLong(2, ride.getDriverId());
            }
            statement.setString(3, ride.getPickup());
            statement.setString(4, ride.getDropoff());
            statement.setString(5, ride.getStatus() == null ? "PENDING" : ride.getStatus());
            statement.setString(6, region.name());

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    ride.setId(resultSet.getLong("id"));
                    Timestamp createdAt = resultSet.getTimestamp("created_at");
                    if (createdAt != null) {
                        ride.setCreatedAt(createdAt.toLocalDateTime());
                    }
                }
            }
            ride.setRegion(region.name());
            if (ride.getStatus() == null) {
                ride.setStatus("PENDING");
            }
            return ride;
        } catch (SQLException ex) {
            throw new RuntimeException("Failed to book ride", ex);
        }
    }

    public List<Ride> getHistory(Long userId, Region region, boolean isReadOnly) {
        if (userId == null) {
            throw new IllegalArgumentException("userId must not be null");
        }
        if (region == null) {
            throw new IllegalArgumentException("region must not be null");
        }

        String sql = """
                SELECT id, user_id, driver_id, pickup, dropoff, status, region, created_at
                FROM rides
                WHERE user_id = ?
                ORDER BY created_at DESC
                """;

        List<Ride> rides = new ArrayList<>();
        try (Connection connection = failoverDataSourceManager.getConnection(region, isReadOnly);
                PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setLong(1, userId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    rides.add(mapRide(resultSet));
                }
            }
            return rides;
        } catch (SQLException ex) {
            throw new RuntimeException("Failed to fetch ride history", ex);
        }
    }

    private Ride mapRide(ResultSet resultSet) throws SQLException {
        Ride ride = new Ride();
        ride.setId(resultSet.getLong("id"));
        ride.setUserId(resultSet.getLong("user_id"));

        long driverId = resultSet.getLong("driver_id");
        if (!resultSet.wasNull()) {
            ride.setDriverId(driverId);
        }

        ride.setPickup(resultSet.getString("pickup"));
        ride.setDropoff(resultSet.getString("dropoff"));
        ride.setStatus(resultSet.getString("status"));
        ride.setRegion(resultSet.getString("region"));

        Timestamp createdAt = resultSet.getTimestamp("created_at");
        if (createdAt != null) {
            ride.setCreatedAt(createdAt.toLocalDateTime());
        }
        return ride;
    }

    private Region parseRegion(String regionValue) {
        if (regionValue == null || regionValue.isBlank()) {
            throw new IllegalArgumentException("ride.region must not be blank");
        }
        try {
            return Region.valueOf(regionValue.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unsupported region: " + regionValue, ex);
        }
    }
}