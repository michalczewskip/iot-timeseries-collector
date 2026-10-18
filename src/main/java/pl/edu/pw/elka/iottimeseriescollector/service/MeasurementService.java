package pl.edu.pw.elka.iottimeseriescollector.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.edu.pw.elka.iottimeseriescollector.entity.MeasurementEntity;
import pl.edu.pw.elka.iottimeseriescollector.model.Measurement;
import pl.edu.pw.elka.iottimeseriescollector.repository.MeasurementRepository;
import pl.edu.pw.elka.iottimeseriescollector.repository.spec.MeasurementSpecification;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class MeasurementService {
    private final MeasurementRepository measurementRepository;

    public MeasurementService(MeasurementRepository measurementRepository) {
        this.measurementRepository = measurementRepository;
    }

    @Transactional(readOnly = true)
    public List<Measurement> getMeasurement(
            String series,
            OffsetDateTime form,
            OffsetDateTime to,
            String sortParam,
            Integer limit) {
        List<UUID> seriesIds = parseSeriesIds(series);
        Sort sort = parseSort(sortParam);
        int effectiveLimit = (limit != null && limit > 0) ? Math.min(limit, 10000) : 1000;
        Pageable pageable = PageRequest.of(0, effectiveLimit, sort);

        Specification<MeasurementEntity> spec = MeasurementSpecification.withFilters(seriesIds, form, to);

        return measurementRepository.findAll(spec, pageable)
                .getContent()
                .stream()
                .map(this::mapEntityToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Measurement getMeasurement(UUID measurementId) {
        MeasurementEntity measurement = measurementRepository.findById(measurementId)
                .orElseThrow(() -> new NoSuchElementException("Pomiar o podanym ID nie istnieje"));

        return mapEntityToDto(measurement);
    }

    private List<UUID> parseSeriesIds(String series) {
        if (series == null || series.isBlank()) {
            return null;
        }
        return Arrays.stream(series.split(","))
                .map(String::trim)
                .map(UUID::fromString)
                .toList();
    }

    private Sort parseSort(String sortParam) {
        if (sortParam != null && sortParam.startsWith("-")) {
            String property = sortParam.substring(1);
            return Sort.by(property).descending();
        }

        String property = (sortParam != null && !sortParam.isBlank()) ? sortParam : "timestamp";
        return Sort.by(property).ascending();
    }

    private Measurement mapEntityToDto(MeasurementEntity entity) {
        Measurement dto = new Measurement();
        dto.setId(entity.getId());
        dto.setSeriesId(entity.getSeriesEntity().getId());
        dto.setValue(entity.getValue());
        dto.setTimestamp(entity.getTimestamp());
        if (entity.getSensorEntity() != null) {
            dto.setSensorId(entity.getSensorEntity().getId());
        }
        return dto;
    }
}
