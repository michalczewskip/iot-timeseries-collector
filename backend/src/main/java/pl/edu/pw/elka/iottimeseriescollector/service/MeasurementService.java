package pl.edu.pw.elka.iottimeseriescollector.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.edu.pw.elka.iottimeseriescollector.entity.MeasurementEntity;
import pl.edu.pw.elka.iottimeseriescollector.entity.SensorEntity;
import pl.edu.pw.elka.iottimeseriescollector.entity.SeriesEntity;
import pl.edu.pw.elka.iottimeseriescollector.exception.UnprocessableEntityException;
import pl.edu.pw.elka.iottimeseriescollector.model.Measurement;
import pl.edu.pw.elka.iottimeseriescollector.model.MeasurementInput;
import pl.edu.pw.elka.iottimeseriescollector.repository.MeasurementRepository;
import pl.edu.pw.elka.iottimeseriescollector.repository.SensorRepository;
import pl.edu.pw.elka.iottimeseriescollector.repository.spec.MeasurementSpecification;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class MeasurementService {
    private final MeasurementRepository measurementRepository;
    private final SensorRepository sensorRepository;

    public MeasurementService(MeasurementRepository measurementRepository, SensorRepository sensorRepository) {
        this.measurementRepository = measurementRepository;
        this.sensorRepository = sensorRepository;
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

    @Transactional
    public Measurement addMeasurement(MeasurementInput measurementInput, UUID sensorId) {
        SensorEntity sensorEntity = sensorRepository.findById(sensorId).orElseThrow(
                () -> new BadCredentialsException("Czujnik nie istnieje"));

        SeriesEntity seriesEntity = sensorEntity.getSeriesEntity();

        BigDecimal minValue = seriesEntity.getMinValue();
        BigDecimal maxValue = seriesEntity.getMaxValue();
        BigDecimal newValue = measurementInput.getValue();
        if (newValue.compareTo(minValue) < 0 || newValue.compareTo(maxValue) > 0) {
            throw new UnprocessableEntityException("Wartość pomiaru poza zakresem serii");
        }

        OffsetDateTime measureTimestamp = Optional.ofNullable(measurementInput.getTimestamp())
                .orElseGet(OffsetDateTime::now);

        if (measureTimestamp.isAfter(OffsetDateTime.now().plusMinutes(5))) {
            throw new UnprocessableEntityException("Niedopuszczalny znacznik czasu dla pomiaru. " +
                    "Czas pomiaru nie może być z przyszłości dalszej niż 5 min");
        }

        MeasurementEntity measurementToSave = MeasurementEntity.builder()
                .seriesEntity(seriesEntity)
                .sensorEntity(sensorEntity)
                .value(newValue)
                .timestamp(measureTimestamp)
                .build();

        MeasurementEntity measurementSaved = measurementRepository.save(measurementToSave);
        return mapEntityToDto(measurementSaved);
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
