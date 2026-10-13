package pl.edu.pw.elka.iottimeseriescollector.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import pl.edu.pw.elka.iottimeseriescollector.api.AuthApi;
import pl.edu.pw.elka.iottimeseriescollector.model.LoginRequest;
import pl.edu.pw.elka.iottimeseriescollector.model.LoginResponse;
import pl.edu.pw.elka.iottimeseriescollector.model.PasswordChange;

@RestController
public class AuthController implements AuthApi {

    @Override
    public ResponseEntity<LoginResponse> apiAuthLoginPost(LoginRequest loginRequest) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Void> apiAuthLogoutPost() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @Override
    public ResponseEntity<Void> apiAuthPasswordPut(PasswordChange passwordChange) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
