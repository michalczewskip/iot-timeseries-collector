package pl.edu.pw.elka.iottimeseriescollector.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import pl.edu.pw.elka.iottimeseriescollector.model.Problem;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
public class SecurityErrorWriter {
    private final ObjectMapper objectMapper;

    public SecurityErrorWriter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void sendError(HttpServletResponse response, HttpStatus status, String title, String detailMessage, String path) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        Problem problem = new Problem();
        problem.setTitle(title);
        problem.setStatus(status.value());
        problem.setDetail(detailMessage);
        problem.setInstance(path);
        problem.setType("about:blank");
        response.getWriter().write(objectMapper.writeValueAsString(problem));
    }

    public void sendUnauthorized(HttpServletResponse response, String detailMessage, String path) throws IOException {
        sendError(response, HttpStatus.UNAUTHORIZED, "Unauthorized", detailMessage, path);
    }
}