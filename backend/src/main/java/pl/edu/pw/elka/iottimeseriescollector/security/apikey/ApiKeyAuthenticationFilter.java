package pl.edu.pw.elka.iottimeseriescollector.security.apikey;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import pl.edu.pw.elka.iottimeseriescollector.entity.SensorEntity;
import pl.edu.pw.elka.iottimeseriescollector.repository.SensorRepository;
import pl.edu.pw.elka.iottimeseriescollector.security.SecurityConstants;
import pl.edu.pw.elka.iottimeseriescollector.security.SecurityErrorWriter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final SensorRepository sensorRepository;
    private final SecurityErrorWriter securityErrorWriter;
    private final ApiKeyManager apiKeyManager;

    public ApiKeyAuthenticationFilter(SensorRepository sensorRepository,
                                      SecurityErrorWriter securityErrorWriter,
                                      ApiKeyManager apiKeyManager) {
        this.sensorRepository = sensorRepository;
        this.securityErrorWriter = securityErrorWriter;
        this.apiKeyManager = apiKeyManager;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String rawApiKey = request.getHeader(SecurityConstants.API_KEY_HEADER);
        if (rawApiKey == null || rawApiKey.isBlank()) {
            securityErrorWriter.sendUnauthorized(
                    response,
                    "Brak wymaganego nagłówka " + SecurityConstants.API_KEY_HEADER,
                    request.getRequestURI());
            return;
        }

        Optional<SensorEntity> sensorEntity = sensorRepository.
                getSensorEntityByApiKeyHash(apiKeyManager.hashApiKey(rawApiKey));

        if (sensorEntity.isEmpty()) {
            securityErrorWriter.sendUnauthorized(
                    response,
                    "Nieprawidłowy klucz API czujnika",
                    request.getRequestURI());
            return;
        }

        SensorEntity sensor = sensorEntity.get();
        SensorPrincipal principal = new SensorPrincipal(
                sensor.getId(),
                sensor.getSeriesEntity().getId(),
                sensor.getName()
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal,
                rawApiKey,
                List.of(new SimpleGrantedAuthority("ROLE_SENSOR"))
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }
}
