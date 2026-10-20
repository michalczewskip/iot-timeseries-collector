package pl.edu.pw.elka.iottimeseriescollector.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pl.edu.pw.elka.iottimeseriescollector.repository.SensorRepository;
import pl.edu.pw.elka.iottimeseriescollector.security.apikey.ApiKeyAuthenticationFilter;
import pl.edu.pw.elka.iottimeseriescollector.security.apikey.ApiKeyManager;
import pl.edu.pw.elka.iottimeseriescollector.security.jwt.JwtAuthenticationFilter;
import pl.edu.pw.elka.iottimeseriescollector.security.jwt.JwtManager;

@Configuration
public class WebSecurityConfig {
    private final SensorRepository sensorRepository;
    private final SecurityErrorWriter securityErrorWriter;
    private final ApiKeyManager apiKeyManager;
    private final JwtManager jwtManager;

    public WebSecurityConfig(SensorRepository sensorRepository,
                             SecurityErrorWriter securityErrorWriter,
                             ApiKeyManager apiKeyManager,
                             JwtManager jwtManager) {
        this.sensorRepository = sensorRepository;
        this.securityErrorWriter = securityErrorWriter;
        this.apiKeyManager = apiKeyManager;
        this.jwtManager = jwtManager;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain sensorSecurityFilterChain(HttpSecurity http) {
        ApiKeyAuthenticationFilter apiKeyAuthenticationFilter = new ApiKeyAuthenticationFilter(
                sensorRepository, securityErrorWriter, apiKeyManager);

        AuthenticationEntryPoint authEntryPoint =
                (request, response, authException) ->
                        securityErrorWriter.sendUnauthorized(
                                response, "Brak lub nieprawidłowe uwierzytelnienie", request.getRequestURI());
        http
                .securityMatcher(request ->
                        "POST".equalsIgnoreCase((request.getMethod()))
                                && "/api/measurements".equals(request.getRequestURI()))
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(apiKeyAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .exceptionHandling(e -> e.authenticationEntryPoint(authEntryPoint));

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) {
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtManager);

        AuthenticationEntryPoint authEntryPoint =
                (request, response, authException) ->
                        securityErrorWriter.sendUnauthorized(
                                response, "Brak lub nieprawidłowe uwierzytelnienie", request.getRequestURI());
        http
                .securityMatcher("/api/**")
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/series", "/api/series/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/measurements", "/api/measurements/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e.authenticationEntryPoint(authEntryPoint));

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new InMemoryUserDetailsManager();
    }
}
