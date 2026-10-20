package pl.edu.pw.elka.iottimeseriescollector.repository.spec;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pl.edu.pw.elka.iottimeseriescollector.entity.MeasurementEntity;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class MeasurementSpecification {

    public static Specification<MeasurementEntity> withFilters(
            List<UUID> seriesIds,
            OffsetDateTime from,
            OffsetDateTime to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (seriesIds != null && !seriesIds.isEmpty()) {
                predicates.add(root.get("seriesEntity").get("id").in(seriesIds));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}