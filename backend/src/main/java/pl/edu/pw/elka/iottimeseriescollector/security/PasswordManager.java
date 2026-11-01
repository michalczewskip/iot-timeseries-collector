package pl.edu.pw.elka.iottimeseriescollector.security;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class PasswordManager {
    private static final String ALGORITHM = "SHA-256";

    public boolean verifyPassword(String rawPassword, String savedHash) {
        return hashPassword(rawPassword).equals(savedHash);
    }

    public String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance(ALGORITHM);
            byte[] hashBytes = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Brak obsługi algorytmu SHA-256 w środowisku JRE", e);
        }
    }
}
