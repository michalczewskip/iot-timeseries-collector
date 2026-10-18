package pl.edu.pw.elka.iottimeseriescollector.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.edu.pw.elka.iottimeseriescollector.entity.SensorEntity;
import pl.edu.pw.elka.iottimeseriescollector.entity.SeriesEntity;
import pl.edu.pw.elka.iottimeseriescollector.exception.UnprocessableEntityException;
import pl.edu.pw.elka.iottimeseriescollector.model.Sensor;
import pl.edu.pw.elka.iottimeseriescollector.model.SensorCreated;
import pl.edu.pw.elka.iottimeseriescollector.model.SensorInput;
import pl.edu.pw.elka.iottimeseriescollector.repository.SensorRepository;
import pl.edu.pw.elka.iottimeseriescollector.repository.SeriesRepository;
import pl.edu.pw.elka.iottimeseriescollector.security.apikey.ApiKeyManager;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;
    private final SeriesRepository seriesRepository;
    private final ApiKeyManager apiKeyManager;

    public SensorService(SensorRepository sensorRepository,
                         SeriesRepository seriesRepository,
                         ApiKeyManager apiKeyManager) {
        this.sensorRepository = sensorRepository;
        this.seriesRepository = seriesRepository;
        this.apiKeyManager = apiKeyManager;
    }

    @Transactional(readOnly = true)
    public List<Sensor> getAllSensors() {
        return sensorRepository.findAll().stream().map(this::mapEntityToSensor).toList();
    }

    @Transactional(readOnly = true)
    public Sensor getSensor(UUID sensorId) {
        SensorEntity sensor = sensorRepository.findById(sensorId)
                .orElseThrow(() -> new NoSuchElementException("Czyjnik o podanym ID nie istnieje"));

        return mapEntityToSensor(sensor);
    }

    @Transactional
    public SensorCreated createSensor(SensorInput sensorInput) {
        SeriesEntity series = seriesRepository.findById(sensorInput.getSeriesId())
                .orElseThrow(() -> new UnprocessableEntityException("Nie znaleziono serii o podanym ID"));

        String rawApiKey = apiKeyManager.generateRawApiKey();
        SensorEntity sensorToSave = SensorEntity.builder()
                .name(sensorInput.getName())
                .seriesEntity(series)
                .apiKeyHash(apiKeyManager.hashApiKey(rawApiKey))
                .build();

        SensorEntity savedSensor = sensorRepository.save(sensorToSave);

        SensorCreated dto = new SensorCreated();
        dto.setId(savedSensor.getId());
        dto.setName(savedSensor.getName());
        dto.setSeriesId(savedSensor.getSeriesEntity().getId());
        dto.setCreatedAt(savedSensor.getCreatedAt());
        dto.setApiKey(rawApiKey);
        return dto;
    }

    @Transactional
    public void deleteSensor(UUID sensorId) {
        SensorEntity sensor = sensorRepository.findById(sensorId)
                .orElseThrow(() -> new NoSuchElementException("Nie znaleziono sensora o podanym ID"));
        sensorRepository.delete(sensor);
    }


    private Sensor mapEntityToSensor(SensorEntity entity) {
        Sensor sensor = new Sensor();
        sensor.setId(entity.getId());
        sensor.setName(entity.getName());
        sensor.setSeriesId(entity.getSeriesEntity().getId());
        sensor.createdAt(entity.getCreatedAt());
        return sensor;
    }
}
