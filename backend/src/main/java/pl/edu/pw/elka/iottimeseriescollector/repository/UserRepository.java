package pl.edu.pw.elka.iottimeseriescollector.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.edu.pw.elka.iottimeseriescollector.entity.UserEntity;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> getUserEntityByUsername(String username);
}
