package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.SeriesApi;
import pl.edu.pw.elka.iottimeseriescollector.model.Series;
import pl.edu.pw.elka.iottimeseriescollector.model.SeriesInput;
import pl.edu.pw.elka.iottimeseriescollector.service.SeriesService;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
public class SeriesController implements SeriesApi {

    private final SeriesService seriesService;

    public SeriesController(SeriesService seriesService) {
        this.seriesService = seriesService;
    }

    @Override
    public ResponseEntity<List<Series>> apiSeriesGet() {
        List<Series> series = seriesService.getAllSeries();
        return ResponseEntity.ok(series);
    }

    @Override
    public ResponseEntity<Series> apiSeriesPost(SeriesInput seriesInput) {
        Series createdSeries = seriesService.createSeries(seriesInput);

        URI location = URI.create("/api/series/" + createdSeries.getId());

        return ResponseEntity
                .created(location)
                .body(createdSeries);
    }

    @Override
    public ResponseEntity<Void> apiSeriesSeriesIdDelete(UUID seriesId) {
        seriesService.deleteSeries(seriesId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Series> apiSeriesSeriesIdPut(UUID seriesId, SeriesInput seriesInput) {
        Series series = seriesService.updateSeries(seriesId, seriesInput);
        return ResponseEntity.ok(series);
    }

    @Override
    public ResponseEntity<Series> apiSeriesSeriesIdGet(UUID seriesId) {
        Series series = seriesService.getSeries(seriesId);
        return ResponseEntity.ok(series);
    }
}
