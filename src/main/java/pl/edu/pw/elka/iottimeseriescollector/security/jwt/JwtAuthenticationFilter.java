package pl.edu.pw.elka.iottimeseriescollector.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import pl.edu.pw.elka.iottimeseriescollector.security.SecurityConstants;

import java.io.IOException;
import java.util.List;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtManager jwtManager;

    public JwtAuthenticationFilter(JwtManager jwtManager) {
        this.jwtManager = jwtManager;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);
        if (authHeader == null || !authHeader.startsWith(SecurityConstants.BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }
        final String jwt = authHeader.substring(SecurityConstants.BEARER_PREFIX.length());
        try {
            final String username = jwtManager.extractUsername(jwt);
            log.debug("Pobrano username z JWT: {} dla ścieżki: {}", username, request.getRequestURI());

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtManager.isTokenValid(jwt, username)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Pomyślnie ustawiono autoryzację w SecurityContext dla użytkownika: {}", username);
                }
                else {
                    log.warn("Token JWT dla użytkownika {} jest NIEPRAWIDŁOWY lub znajduje się na czarnej liście! URI: {}", username, request.getRequestURI());
                }
            }
        } catch (Exception e) {
            // Do not authenticate if any exception occur
            // KLUCZOWE: Zamiast cichego ignorowania, zaloguj dokładny błąd
            log.warn("Błąd podczas weryfikacji tokenu JWT na ścieżce {}: {}", request.getRequestURI(), e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
