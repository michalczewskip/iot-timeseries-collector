package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.SensorsApi;
import pl.edu.pw.elka.iottimeseriescollector.model.Sensor;
import pl.edu.pw.elka.iottimeseriescollector.model.SensorCreated;
import pl.edu.pw.elka.iottimeseriescollector.model.SensorInput;
import pl.edu.pw.elka.iottimeseriescollector.service.SensorService;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
public class SensorController implements SensorsApi {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @Override
    public ResponseEntity<List<Sensor>> apiSensorsGet() {
        List<Sensor> sensors = sensorService.getAllSensors();
        return ResponseEntity.ok(sensors);
    }

    @Override
    public ResponseEntity<SensorCreated> apiSensorsPost(SensorInput sensorInput) {
        SensorCreated sensorCreated = sensorService.createSensor(sensorInput);
        URI location = URI.create("/api/sensors/" + sensorCreated.getId());
        return ResponseEntity
                .created(location)
                .body(sensorCreated);
    }

    @Override
    @DeleteMapping(value = "/api/sensors/{sensorId}", produces = {}) // Overrides default OpenAPI generator 'produces' header to avoid HTTP 406 on 204
    public ResponseEntity<Void> apiSensorsSensorIdDelete(@PathVariable("sensorId") UUID sensorId) {
        sensorService.deleteSensor(sensorId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Sensor> apiSensorsSensorIdGet(UUID sensorId) {
        Sensor sensor = sensorService.getSensor(sensorId);
        return ResponseEntity.ok(sensor);
    }
}
