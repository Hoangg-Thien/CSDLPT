package com.rideapp.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Bean(name = "flywaySouth", initMethod = "migrate")
    public Flyway flywaySouth(
            @Qualifier("southPrimaryDS") DataSource dataSource,
            @Value("${spring.flyway.locations:classpath:db/migration}") String[] locations,
            @Value("${spring.flyway.baseline-on-migrate:false}") boolean baselineOnMigrate,
            @Value("${spring.flyway.baseline-version:1}") String baselineVersion) {
        return buildFlyway(dataSource, locations, baselineOnMigrate, baselineVersion);
    }

    @Bean(name = "flywayNorth", initMethod = "migrate")
    public Flyway flywayNorth(
            @Qualifier("northPrimaryDS") DataSource dataSource,
            @Value("${spring.flyway.locations:classpath:db/migration}") String[] locations,
            @Value("${spring.flyway.baseline-on-migrate:false}") boolean baselineOnMigrate,
            @Value("${spring.flyway.baseline-version:1}") String baselineVersion) {
        return buildFlyway(dataSource, locations, baselineOnMigrate, baselineVersion);
    }

    private Flyway buildFlyway(
            DataSource dataSource,
            String[] locations,
            boolean baselineOnMigrate,
            String baselineVersion) {
        return Flyway.configure()
                .dataSource(dataSource)
                .locations(locations)
                .baselineOnMigrate(baselineOnMigrate)
                .baselineVersion(baselineVersion)
                .load();
    }
}