package config;

import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import java.util.Properties;

@Configuration
public class JpaConfig {

    @Bean(name = "entityManagerFactory")
    @DependsOn({"flywaySouth", "flywayNorth"})  // ✅ chờ Flyway chạy xong
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("southPrimaryDS") DataSource dataSource) {

        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("entity");

        HibernateJpaVendorAdapter adapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(adapter);

        Properties props = new Properties();
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        props.setProperty("hibernate.hbm2ddl.auto", "validate");
        props.setProperty("hibernate.show_sql", "true");
        em.setJpaProperties(props);

        return em;
    }

    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(
            @Qualifier("entityManagerFactory")
            LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        JpaTransactionManager tm = new JpaTransactionManager();
        tm.setEntityManagerFactory(entityManagerFactory.getObject());
        return tm;
    }
}