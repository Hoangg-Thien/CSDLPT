package com.rideapp.repository;
import com.rideapp.entity.User;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class MultiRegionUserRepository {

    private final MultiRegionTemplate template;

    public MultiRegionUserRepository(MultiRegionTemplate template) {
        this.template = template;
    }

    public List<User> findAll() {
        return template.queryBoth("SELECT * FROM users", (rs, i) -> {
            User u = new User();
            u.setId(rs.getLong("id"));
            u.setFullName(rs.getString("full_name"));
            u.setPhone(rs.getString("phone"));
            u.setProvince(rs.getString("province"));
            u.setRegion(rs.getString("region"));
            return u;
        });
    }
}