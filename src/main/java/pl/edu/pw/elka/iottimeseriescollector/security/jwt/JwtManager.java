package pl.edu.pw.elka.iottimeseriescollector.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class JwtManager {

    private final SecretKey secretKey;
    private final int expirationTime;

    // Important! Usage of thread safe hash map <JWT Token, expiration date>
    private final Map<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    public JwtManager(
            @Value(value = "${jwt.secret}") String secret,
            @Value(value = "${jwt.expiration-seconds}") int expirationTime) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    public String generateToken(String username) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ROLE_ADMIN");

        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expiration = new Date(nowMillis + (expirationTime * 1000L));

        return Jwts.builder()
                .subject(username)
                .claims(extraClaims)
                .id(UUID.randomUUID().toString()) // Needed to prevent same token to issued (can cause blacklisting both tokens if issued at the same issued time)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public void invalidateToken(String token) {
        if (token != null && !token.isBlank()) {
            try {
                Date exp = extractAllClaims(token).getExpiration();
                blacklistedTokens.put(token, exp);
                log.info("Token został dodany do czarnej listy (wygasa: {})", exp);
            } catch (JwtException | IllegalArgumentException e) {
                // Do not save token if it is expired or invalid
                log.warn("Nie udało się unieważnić tokena (błędny lub wygasł): {}", e.getMessage());
            }
        }
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        if (token == null || token.isBlank()) {
            log.warn("Walidacja JWT: Token jest pusty lub null");
            return false;
        }
        if (blacklistedTokens.containsKey(token)) {
            log.warn("Walidacja JWT: Token znajduje się na czarnej liście!");
            return false;
        }
        try {
            String extractedUser = extractUsername(token);
            boolean userMatches = extractedUser != null && extractedUser.equals(expectedUsername);
            boolean expired = isTokenExpired(token);
            if (!userMatches) {
                log.warn("Walidacja JWT: Niezgodność użytkownika! W tokenie: '{}', oczekiwano: '{}'", extractedUser, expectedUsername);
            }
            if (expired) {
                log.warn("Walidacja JWT: Token wygasł dla użytkownika: {}", extractedUser);
            }
            if (userMatches && !expired) {
                log.debug("Walidacja JWT: Token jest w pełni poprawny dla użytkownika: {}", extractedUser);
                return true;
            }
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Walidacja JWT: Wyjątek podczas sprawdzania tokena: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public int getExpiresInSeconds() {
        return expirationTime;
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token).getPayload();
    }

    @Scheduled(fixedRate = 3600000)
    public void purgeExpiredBlacklistedTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet()
                .removeIf(entry -> entry.getValue().before(now));
    }
}
