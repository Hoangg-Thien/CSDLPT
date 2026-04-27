package com.rideapp.repository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;

@Component
public class MultiRegionTemplate {

    private final JdbcTemplate southJdbc;
    private final JdbcTemplate northJdbc;

    public MultiRegionTemplate(
            @Qualifier("southDataSource") DataSource south,
            @Qualifier("northDataSource") DataSource north) {
        this.southJdbc = new JdbcTemplate(south);
        this.northJdbc = new JdbcTemplate(north);
    }

    public <T> List<T> queryBoth(String sql, RowMapper<T> mapper) {
        List<T> result = new ArrayList<>();
        result.addAll(southJdbc.query(sql, mapper));
        result.addAll(northJdbc.query(sql, mapper));
        return result;
    }
}