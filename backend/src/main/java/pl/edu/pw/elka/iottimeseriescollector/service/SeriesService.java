package pl.edu.pw.elka.iottimeseriescollector.service;

import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.edu.pw.elka.iottimeseriescollector.entity.SeriesEntity;
import pl.edu.pw.elka.iottimeseriescollector.exception.SeriesConflictException;
import pl.edu.pw.elka.iottimeseriescollector.exception.UnprocessableEntityException;
import pl.edu.pw.elka.iottimeseriescollector.model.Series;
import pl.edu.pw.elka.iottimeseriescollector.model.SeriesInput;
import pl.edu.pw.elka.iottimeseriescollector.repository.MeasurementRepository;
import pl.edu.pw.elka.iottimeseriescollector.repository.SeriesRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final MeasurementRepository measurementRepository;

    public SeriesService(SeriesRepository seriesRepository,
                         MeasurementRepository measurementRepository) {
        this.seriesRepository = seriesRepository;
        this.measurementRepository = measurementRepository;
    }

    @Transactional(readOnly = true)
    public Series getSeries(UUID seriesId) {
        SeriesEntity series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new NoSuchElementException("Seria o podanym ID nie istnieje"));

        return mapEntityToSeries(series);
    }

    @Transactional(readOnly = true)
    public List<Series> getAllSeries() {
        return seriesRepository.findAll().stream().map(this::mapEntityToSeries).toList();
    }

    @Transactional
    public Series createSeries(SeriesInput seriesInput) {
        if (seriesInput.getMinValue().compareTo(seriesInput.getMaxValue()) >= 0) {
            throw new UnprocessableEntityException("Wartość minValue musi być mniejsza do maxValue");
        }

        SeriesEntity newSeries = SeriesEntity.builder()
                .name(seriesInput.getName())
                .minValue(seriesInput.getMinValue())
                .maxValue(seriesInput.getMaxValue())
                .color(seriesInput.getColor())
                .icon(unwrap(seriesInput.getIcon()))
                .unit(unwrap(seriesInput.getUnit()))
                .build();

        return mapEntityToSeries(seriesRepository.save(newSeries));
    }

    @Transactional
    public void deleteSeries(UUID seriesId) {
        SeriesEntity series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new NoSuchElementException("Seria o podanym ID nie istnieje"));
        seriesRepository.delete(series);
    }

    @Transactional
    public Series updateSeries(UUID seriesId, SeriesInput seriesInput) {
        SeriesEntity seriesEntity = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new NoSuchElementException("Seria o podanym ID nie istnieje"));

        if (seriesInput.getMinValue().compareTo(seriesInput.getMaxValue()) >= 0) {
            throw new UnprocessableEntityException("Wartość minValue musi być mniejsza do maxValue");
        }

        BigDecimal newMin = seriesInput.getMinValue();
        BigDecimal newMax = seriesInput.getMaxValue();

        boolean hasOutlierMeasurements = measurementRepository.existsOutOfBoundForSeries(
                seriesEntity.getId(), newMin, newMax);

        if (hasOutlierMeasurements) {
            throw new SeriesConflictException("Nie można zmodyfikować zakresu serii. " +
                    "Istnieją pomiary wykraczające poza nowe wartości minValuea i maxValue");
        }

        seriesEntity.setName(seriesInput.getName());
        seriesEntity.setMinValue(newMin);
        seriesEntity.setMaxValue(newMax);
        seriesEntity.setColor(seriesInput.getColor());
        if (seriesInput.getIcon() != null) {
            seriesEntity.setIcon(unwrap(seriesInput.getIcon()));
        }
        if (seriesInput.getUnit() != null) {
            seriesEntity.setUnit(unwrap(seriesInput.getUnit()));
        }

        return mapEntityToSeries(seriesRepository.save(seriesEntity));
    }


    private Series mapEntityToSeries(SeriesEntity entity) {
        Series series = new Series();
        series.setName(entity.getName());
        series.setMinValue(entity.getMinValue());
        series.setMaxValue(entity.getMaxValue());
        series.setUnit(JsonNullable.of(entity.getUnit()));
        series.setColor(entity.getColor());
        series.setId(entity.getId());
        return series;
    }

    private <T> T unwrap(JsonNullable<T> jsonNullable) {
        return (jsonNullable != null && jsonNullable.isPresent()) ? jsonNullable.get() : null;
    }
}
