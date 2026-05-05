package com.rideapp.repository;

import com.rideapp.entity.Ride;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class MultiRegionRideRepository {

    private final MultiRegionTemplate template;

    public MultiRegionRideRepository(MultiRegionTemplate template) {
        this.template = template;
    }

    /**
     * Lấy tất cả chuyến đi từ cả 2 miền (Dùng cho Web Admin)
     */
    public List<Ride> findAll() {
        String sql = "SELECT * FROM rides ORDER BY id DESC";
        return template.queryBoth(sql, (rs, i) -> {
            Ride r = new Ride();
            r.setId(rs.getLong("id"));
            r.setUserId(rs.getLong("user_id"));
            r.setDriverId(rs.getLong("driver_id"));
            r.setPickup(rs.getString("pickup"));
            r.setDropoff(rs.getString("dropoff"));
            r.setStatus(rs.getString("status"));
            r.setRegion(rs.getString("region"));
            r.setPrice(rs.getString("price")); // Lấy thêm cột giá tiền
            return r;
        });
    }

    /**
     * Tìm một chuyến đi cụ thể theo ID (Dùng cho tính năng Hoàn thành chuyến đi)
     */
    public Optional<Ride> findById(Long id) {
        String sql = "SELECT * FROM rides WHERE id = " + id;
        List<Ride> rides = template.queryBoth(sql, (rs, i) -> {
            Ride r = new Ride();
            r.setId(rs.getLong("id"));
            r.setUserId(rs.getLong("user_id"));
            r.setDriverId(rs.getLong("driver_id"));
            r.setPickup(rs.getString("pickup"));
            r.setDropoff(rs.getString("dropoff"));
            r.setStatus(rs.getString("status"));
            r.setRegion(rs.getString("region"));
            r.setPrice(rs.getString("price"));
            return r;
        });

        if (rides.isEmpty()) {
            return Optional.empty();
        }
        // Vì ID là duy nhất, nếu tìm thấy thì trả về phần tử đầu tiên
        return Optional.of(rides.get(0));
    }

    /**
     * Lưu thông tin cập nhật của chuyến đi (Ghi vào đúng Primary DB của miền đó)
     */
    public void save(Ride ride) {
        // Tạo câu lệnh SQL cập nhật trạng thái dựa trên ID
        // Sử dụng String.format để tránh lỗi nối chuỗi SQL
        String sql = String.format(
                "UPDATE rides SET status = '%s' WHERE id = %d",
                ride.getStatus(),
                ride.getId());

        // Gọi hàm updateByRegion đã viết ở MultiRegionTemplate
        // Nó sẽ tự động kiểm tra ride.getRegion() là "SOUTH" hay "NORTH" để bắn SQL đi
        template.updateByRegion(ride.getRegion(), sql);
    }
}