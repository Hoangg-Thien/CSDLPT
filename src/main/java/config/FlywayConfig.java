package config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    @Bean(name = "flywayNorth", initMethod = "migrate")
    public Flyway flywayNorth(
            @Qualifier("northPrimaryDS") DataSource northDS) {
        return Flyway.configure()
                .dataSource(northDS)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("2")
                .load();
    }

    @Bean(name = "flywaySouth", initMethod = "migrate")
    public Flyway flywaySouth(
            @Qualifier("southPrimaryDS") DataSource southDS) {
        return Flyway.configure()
                .dataSource(southDS)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .baselineVersion("2")
                .load();
    }
}