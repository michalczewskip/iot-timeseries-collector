package pl.edu.pw.elka.iottimeseriescollector.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.edu.pw.elka.iottimeseriescollector.entity.MeasurementEntity;

import java.math.BigDecimal;
import java.util.UUID;

public interface MeasurementRepository extends JpaRepository<MeasurementEntity, UUID> {

    @Query("SELECT COUNT(m) > 0 FROM MeasurementEntity m " +
            "WHERE m.seriesEntity.id = :seriesId " +
            "AND (m.value < :minVal OR  m.value > :maxVal)")
    boolean existsOutOfBoundForSeries(
            @Param("seriesId") UUID seriesId,
            @Param("minVal") BigDecimal minVal,
            @Param("maxVal") BigDecimal maxVal);
}
