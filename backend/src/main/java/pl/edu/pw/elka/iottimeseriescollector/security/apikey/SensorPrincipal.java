package pl.edu.pw.elka.iottimeseriescollector.security.apikey;

import java.util.UUID;

public record SensorPrincipal(UUID id, UUID seriesId, String name) {}
