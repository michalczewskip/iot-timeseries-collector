package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.MeasurementsApi;
import pl.edu.pw.elka.iottimeseriescollector.model.Id;
import pl.edu.pw.elka.iottimeseriescollector.model.Measurement;
import pl.edu.pw.elka.iottimeseriescollector.model.MeasurementInput;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
public class MeasurementsController implements MeasurementsApi {
    @Override
    public ResponseEntity<List<Measurement>> apiMeasurementsGet(@Nullable String series, @Nullable OffsetDateTime from, @Nullable OffsetDateTime to, String sort, Integer limit) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Measurement> apiMeasurementsMeasurementIdGet(Id measurementId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Measurement> apiMeasurementsPost(MeasurementInput measurementInput) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
