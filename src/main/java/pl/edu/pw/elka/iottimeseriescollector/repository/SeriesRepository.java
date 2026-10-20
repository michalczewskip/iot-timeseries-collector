package pl.edu.pw.elka.iottimeseriescollector.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.edu.pw.elka.iottimeseriescollector.entity.SeriesEntity;

import java.util.UUID;

public interface SeriesRepository extends JpaRepository<SeriesEntity, UUID> {
}
