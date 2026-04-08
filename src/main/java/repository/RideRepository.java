package repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import entity.Ride;


@Repository
public interface RideRepository extends JpaRepository<Ride, Long>{   
}