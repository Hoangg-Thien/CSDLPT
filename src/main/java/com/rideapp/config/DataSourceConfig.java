package com.rideapp.config;

import com.rideapp.routing.DataSourceType;
import com.rideapp.routing.RoutingDataSource;
import com.zaxxer.hikari.HikariDataSource;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource southPrimaryDS(
            @Value("${app.regions.south.primary-url}") String jdbcUrl,
            @Value("${app.regions.south.username}") String username,
            @Value("${app.regions.south.password}") String password) {
        return buildRegionDataSource(jdbcUrl, username, password);
    }

    @Bean
    public DataSource southReplicaDS(
            @Value("${app.regions.south.replica-url}") String jdbcUrl,
            @Value("${app.regions.south.username}") String username,
            @Value("${app.regions.south.password}") String password) {
        return buildRegionDataSource(jdbcUrl, username, password);
    }

    @Bean
    public DataSource northPrimaryDS(
            @Value("${app.regions.north.primary-url}") String jdbcUrl,
            @Value("${app.regions.north.username}") String username,
            @Value("${app.regions.north.password}") String password) {
        return buildRegionDataSource(jdbcUrl, username, password);
    }

    @Bean
    public DataSource northReplicaDS(
            @Value("${app.regions.north.replica-url}") String jdbcUrl,
            @Value("${app.regions.north.username}") String username,
            @Value("${app.regions.north.password}") String password) {
        return buildRegionDataSource(jdbcUrl, username, password);
    }

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.primary")
    public DataSource primaryDataSource() {
        return new HikariDataSource();
    }

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.replica")
    public DataSource replicaDataSource() {
        return new HikariDataSource();
    }

    @Bean
    public DataSource routingDataSource(
            @Qualifier("primaryDataSource") DataSource primaryDataSource,
            @Qualifier("replicaDataSource") DataSource replicaDataSource) {
        RoutingDataSource routingDataSource = new RoutingDataSource();
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put(DataSourceType.PRIMARY, primaryDataSource);
        targetDataSources.put(DataSourceType.REPLICA, replicaDataSource);
        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(primaryDataSource);
        return routingDataSource;
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSource routingDataSource) {
        return new LazyConnectionDataSourceProxy(routingDataSource);
    }

    private DataSource buildRegionDataSource(String jdbcUrl, String username, String password) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName("org.postgresql.Driver");
        // Fail fast: if DB is down, give up quickly instead of blocking threads
        dataSource.setConnectionTimeout(2000);       // 2 seconds max to get a connection
        dataSource.setValidationTimeout(1500);       // 1.5 seconds max to validate
        dataSource.setInitializationFailTimeout(-1); // Don't fail on startup if DB is down
        dataSource.setMaximumPoolSize(5);            // Keep pool small to avoid exhaustion
        return dataSource;
    }
}