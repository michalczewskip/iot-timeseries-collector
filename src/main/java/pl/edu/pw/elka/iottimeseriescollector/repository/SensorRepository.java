package pl.edu.pw.elka.iottimeseriescollector.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.edu.pw.elka.iottimeseriescollector.entity.SensorEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SensorRepository extends JpaRepository<SensorEntity, UUID> {

    Optional<SensorEntity> getSensorEntityByApiKeyHash(String apiKeyHash);
}
