package config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import javax.sql.DataSource;

@Configuration
public class RegionDataSourceConfig {

    @Value("${app.regions.south.primary-url}")
    String southUrl;
    @Value("${app.regions.south.username}")
    String southUser;
    @Value("${app.regions.south.password}")
    String southPass;

    @Value("${app.regions.north.primary-url}")
    String northUrl;
    @Value("${app.regions.north.username}")
    String northUser;
    @Value("${app.regions.north.password}")
    String northPass;

    @Bean(name = "southDataSource")
    @Primary
    public DataSource southDataSource() {
        return DataSourceBuilder.create()
                .url(southUrl).username(southUser).password(southPass)
                .driverClassName("org.postgresql.Driver").build();
    }

    @Bean(name = "northDataSource")
    public DataSource northDataSource() {
        return DataSourceBuilder.create()
                .url(northUrl).username(northUser).password(northPass)
                .driverClassName("org.postgresql.Driver").build();
    }
}