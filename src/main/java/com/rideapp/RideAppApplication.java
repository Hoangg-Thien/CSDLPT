package com.rideapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = { "com.rideapp", "config", "controller", "exception", "routing", "service" })
@EntityScan(basePackages = { "entity" })
@EnableJpaRepositories(basePackages = { "repository" })
public class RideAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(RideAppApplication.class, args);
	}

}
