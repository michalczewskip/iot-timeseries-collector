package pl.edu.pw.elka.iottimeseriescollector.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import pl.edu.pw.elka.iottimeseriescollector.model.Problem;
import pl.edu.pw.elka.iottimeseriescollector.model.ProblemErrorsInner;

import java.util.NoSuchElementException;

@SuppressWarnings("unused")
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Problem> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Problem problem = buildProblem(HttpStatus.BAD_REQUEST, "Bad Request", "Niepoprawne dane wejściowe", request.getRequestURI());
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            ProblemErrorsInner errorInner = new ProblemErrorsInner();
            errorInner.setField(fieldError.getField());
            errorInner.setMessage(fieldError.getDefaultMessage());
            problem.addErrorsItem(errorInner);
        }
        return toResponseEntity(HttpStatus.BAD_REQUEST, problem);
    }

    // HTTP 400
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class, IllegalArgumentException.class})
    public ResponseEntity<Problem> handleBadRequest(Exception ex, HttpServletRequest request) {
        return createResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Niepoprawna składnia żądania lub typ parametru", request);
    }

    // HTTP 401 Unauthorized
    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<Problem> handleUnauthorized(Exception ex, HttpServletRequest request) {
        return createResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), request);
    }

    // HTTP 403 Forbidden
    @ExceptionHandler({InvalidCurrentPasswordException.class, AccessDeniedException.class})
    public ResponseEntity<Problem> handleForbidden(Exception ex, HttpServletRequest request) {
        return createResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
    }

    // HTTP 404 Not Found
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Problem> handleNotFound(Exception ex, HttpServletRequest request) {
        return createResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage() != null ? ex.getMessage() : "Zasób nie istnieje", request);
    }

    // HTTP 406 Not Acceptable
    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<Problem> handleNotAcceptable(HttpMediaTypeNotAcceptableException ex, HttpServletRequest request) {
        return createResponse(HttpStatus.NOT_ACCEPTABLE, "Not Acceptable", "Serwer nie posiada reprezentacji zgodnej z nagłówkiem Accept", request);
    }

    // HTTP 415 Unsupported Media Type
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Problem> handleUnsupportedMediaType(HttpMediaTypeNotAcceptableException ex, HttpServletRequest request) {
        return createResponse(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported Media", "Treść żadania w nieobsługiwanym formacie", request);
    }

    // HTTP 409 Conflict
    @ExceptionHandler(SeriesConflictException.class)
    public ResponseEntity<Problem> handleConflict(SeriesConflictException ex, HttpServletRequest request) {
        return createResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    // HTTP 422 Unprocessable Entity
    @ExceptionHandler(UnprocessableEntityException.class)
    public ResponseEntity<Problem> handleUnprocessable(UnprocessableEntityException ex, HttpServletRequest request) {
        return createResponse(HttpStatus.UNPROCESSABLE_CONTENT, "Unprocessable Entity", ex.getMessage(), request);
    }

    // HTTP 500 Internal Server Error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Problem> handleGenericException(Exception ex, HttpServletRequest request) {
        return createResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "Wystąpił nieoczekiwany błąd serwera", request);
    }

    private ResponseEntity<Problem> createResponse(HttpStatus status, String title, String detail, HttpServletRequest request) {
        return toResponseEntity(status, buildProblem(status, title, detail, request.getRequestURI()));
    }

    private ResponseEntity<Problem> toResponseEntity(HttpStatus status, Problem problem) {
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(problem);
    }

    private Problem buildProblem(HttpStatus status, String title, String detail, String path) {
        Problem problem = new Problem();
        problem.setType("about:blank");
        problem.setTitle(title);
        problem.setStatus(status.value());
        problem.setDetail(detail);
        problem.setInstance(path);
        return problem;
    }
}
