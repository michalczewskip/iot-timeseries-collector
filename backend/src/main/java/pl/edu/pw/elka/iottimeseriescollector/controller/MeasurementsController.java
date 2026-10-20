package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.jspecify.annotations.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.MeasurementsApi;
import pl.edu.pw.elka.iottimeseriescollector.model.Measurement;
import pl.edu.pw.elka.iottimeseriescollector.model.MeasurementInput;
import pl.edu.pw.elka.iottimeseriescollector.security.apikey.SensorPrincipal;
import pl.edu.pw.elka.iottimeseriescollector.service.MeasurementService;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
public class MeasurementsController implements MeasurementsApi {

    private final MeasurementService measurementService;

    public MeasurementsController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @Override
    public ResponseEntity<List<Measurement>> apiMeasurementsGet(@Nullable String series,
                                                                @Nullable OffsetDateTime from,
                                                                @Nullable OffsetDateTime to,
                                                                String sort,
                                                                Integer limit) {
        List<Measurement> measurements = measurementService.getMeasurement(series, from, to, sort, limit);
        return ResponseEntity.ok(measurements);
    }

    @Override
    public ResponseEntity<Measurement> apiMeasurementsMeasurementIdGet(UUID measurementId) {
        Measurement measurement = measurementService.getMeasurement(measurementId);
        return ResponseEntity.ok(measurement);
    }

    @Override
    public ResponseEntity<Measurement> apiMeasurementsPost(MeasurementInput measurementInput) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SensorPrincipal sensorPrincipal)) {
            throw new BadCredentialsException("Nieprawidłowe uwierzytelnienie czujnika");
        }
        Measurement measurement = measurementService.addMeasurement(
                measurementInput,
                sensorPrincipal.id());

        URI location = URI.create("/api/measurements/" + measurement.getId());
        return ResponseEntity
                .created(location)
                .body(measurement);
    }
}
