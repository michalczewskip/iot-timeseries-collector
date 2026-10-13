package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.SeriesApi;
import pl.edu.pw.elka.iottimeseriescollector.model.Id;
import pl.edu.pw.elka.iottimeseriescollector.model.Series;
import pl.edu.pw.elka.iottimeseriescollector.model.SeriesInput;

import java.util.List;

@RestController
public class SeriesController implements SeriesApi {

    @Override
    public ResponseEntity<List<Series>> apiSeriesGet() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Series> apiSeriesPost(SeriesInput seriesInput) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Void> apiSeriesSeriesIdDelete(Id seriesId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Series> apiSeriesSeriesIdPut(Id seriesId, SeriesInput seriesInput) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Series> apiSeriesSeriesIdGet(Id seriesId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
