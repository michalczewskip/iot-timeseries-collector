package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.SensorsApi;
import pl.edu.pw.elka.iottimeseriescollector.model.Id;
import pl.edu.pw.elka.iottimeseriescollector.model.Sensor;
import pl.edu.pw.elka.iottimeseriescollector.model.SensorCreated;
import pl.edu.pw.elka.iottimeseriescollector.model.SensorInput;

import java.util.List;

@RestController
public class SensorController implements SensorsApi {
    @Override
    public ResponseEntity<List<Sensor>> apiSensorsGet() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<SensorCreated> apiSensorsPost(SensorInput sensorInput) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Void> apiSensorsSensorIdDelete(Id sensorId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Sensor> apiSensorsSensorIdGet(Id sensorId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
