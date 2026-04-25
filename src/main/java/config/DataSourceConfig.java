package config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Value("${app.regions.south.username}")
    private String southUsername;

    @Value("${app.regions.south.password}")
    private String southPassword;

    @Value("${app.regions.north.username}")
    private String northUsername;

    @Value("${app.regions.north.password}")
    private String northPassword;

    @Bean("southPrimaryDS")
    @Primary
    public DataSource southPrimaryDataSource(
            @Value("${app.regions.south.primary-url}") String url) {
        return createDataSource(url, southUsername, southPassword, "south-primary-pool");
    }

    @Bean("southReplicaDS")
    public DataSource southReplicaDataSource(
            @Value("${app.regions.south.replica-url}") String url) {
        return createDataSource(url, southUsername, southPassword, "south-replica-pool");
    }

    @Bean("northPrimaryDS")
    public DataSource northPrimaryDataSource(
            @Value("${app.regions.north.primary-url}") String url) {
        return createDataSource(url, northUsername, northPassword, "north-primary-pool");
    }

    @Bean("northReplicaDS")
    public DataSource northReplicaDataSource(
            @Value("${app.regions.north.replica-url}") String url) {
        return createDataSource(url, northUsername, northPassword, "north-replica-pool");
    }

    private DataSource createDataSource(String jdbcUrl, String username, String password, String poolName) {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driverClassName);
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setPoolName(poolName);
        return new HikariDataSource(config);
    }
}