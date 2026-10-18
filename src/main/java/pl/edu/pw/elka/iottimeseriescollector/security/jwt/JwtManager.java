package pl.edu.pw.elka.iottimeseriescollector.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
                .claims(extraClaims)
                .subject(username)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public void invalidateToken(String token) {
        if (token != null && !token.isBlank()) {
            try {
                blacklistedTokens.put(token, extractAllClaims(token).getExpiration());
            } catch (JwtException | IllegalArgumentException ignored) {
                // Do not save token if it is expired or invalid
            }
        }
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        if (token == null || token.isBlank() || blacklistedTokens.containsKey(token)) {
            return false;
        }
        try {
            String extractedUser = extractUsername(token);
            return (extractedUser.equals(expectedUsername) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
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
