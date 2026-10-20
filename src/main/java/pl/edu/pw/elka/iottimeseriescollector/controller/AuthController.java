package pl.edu.pw.elka.iottimeseriescollector.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.AuthApi;
import pl.edu.pw.elka.iottimeseriescollector.entity.UserEntity;
import pl.edu.pw.elka.iottimeseriescollector.exception.InvalidCurrentPasswordException;
import pl.edu.pw.elka.iottimeseriescollector.model.LoginRequest;
import pl.edu.pw.elka.iottimeseriescollector.model.LoginResponse;
import pl.edu.pw.elka.iottimeseriescollector.model.PasswordChange;
import pl.edu.pw.elka.iottimeseriescollector.repository.UserRepository;
import pl.edu.pw.elka.iottimeseriescollector.security.PasswordManager;
import pl.edu.pw.elka.iottimeseriescollector.security.SecurityConstants;
import pl.edu.pw.elka.iottimeseriescollector.security.jwt.JwtManager;

import java.security.Principal;
import java.util.Optional;

@SuppressWarnings("RedundantDefaultParameterValueAssignment")
@RestController
public class AuthController implements AuthApi {

    private final HttpServletRequest request;

    private final UserRepository userRepository;
    private final JwtManager jwtManager;
    private final PasswordManager passwordManager;

    public AuthController(HttpServletRequest request,
                          UserRepository userRepository,
                          JwtManager jwtManager,
                          PasswordManager passwordManager) {
        this.request = request;
        this.userRepository = userRepository;
        this.jwtManager = jwtManager;
        this.passwordManager = passwordManager;
    }

    @Override
    public ResponseEntity<LoginResponse> apiAuthLoginPost(LoginRequest loginRequest) {
        UserEntity user = userRepository.getUserEntityByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Niepoprawny login lub hasło"));

        String savedPasswordHash = user.getPasswordHash();
        boolean isPasswordValid = passwordManager.verifyPassword(loginRequest.getPassword(), savedPasswordHash);

        if (isPasswordValid) {
            LoginResponse response = new LoginResponse(
                    jwtManager.generateToken(user.getUsername()),
                    LoginResponse.TokenTypeEnum.BEARER,
                    jwtManager.getExpiresInSeconds()
            );
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
        throw new BadCredentialsException("Niepoprawny login lub hasło");
    }

    @Override
    @PostMapping(value = "/api/auth/logout", produces = {}) // Overrides default OpenAPI generator 'produces' header to avoid HTTP 406 on 204
    public ResponseEntity<Void> apiAuthLogoutPost() {
        String authHeader = request.getHeader(SecurityConstants.AUTHORIZATION_HEADER);

        if (authHeader == null || !authHeader.startsWith(SecurityConstants.BEARER_PREFIX)) {
            throw new BadCredentialsException("Brak lub nieprawidłowe uwierzytelnienie");
        }

        String jwt = authHeader.substring(SecurityConstants.BEARER_PREFIX.length());
        jwtManager.invalidateToken(jwt);
        SecurityContextHolder.clearContext();

        return ResponseEntity.noContent().build();
    }

    @Override
    @PutMapping(value = "/api/auth/password", produces = {}) // Overrides default OpenAPI generator 'produces' header to avoid HTTP 406 on 204
    public ResponseEntity<Void> apiAuthPasswordPut(PasswordChange passwordChange) {
        String username = Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Principal::getName)
                .orElseThrow(
                        () -> new BadCredentialsException("Brak lub nieprawidłowe uwierzytelnienie"));

        UserEntity user = userRepository.getUserEntityByUsername(username).orElseThrow(
                () -> new BadCredentialsException("Użytkownik nie istnieje"));

        if (!passwordManager.verifyPassword(passwordChange.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCurrentPasswordException("Podane bieżące hasło jest niepoprawne");
        }
        user.setPasswordHash(passwordManager.hashPassword(passwordChange.getNewPassword()));
        userRepository.saveAndFlush(user);

        return ResponseEntity.noContent().build();
    }
}
