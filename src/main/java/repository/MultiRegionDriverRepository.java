package repository;

import entity.Driver;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class MultiRegionDriverRepository {

    private final MultiRegionTemplate template;

    public MultiRegionDriverRepository(MultiRegionTemplate template) {
        this.template = template;
    }

    public List<Driver> findAll() {
        return template.queryBoth("SELECT * FROM drivers", (rs, i) -> {
            Driver d = new Driver();
            d.setId(rs.getLong("id"));
            d.setFullName(rs.getString("full_name"));
            d.setPhone(rs.getString("phone"));
            d.setProvince(rs.getString("province"));
            d.setRegion(rs.getString("region"));
            d.setIsAvailable(rs.getBoolean("is_available"));
            return d;
        });
    }
}