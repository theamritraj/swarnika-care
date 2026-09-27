package com.swarnikacare.doctor.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleDoctorNotFoundException(DoctorNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "DOCTOR_NOT_FOUND");
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "INVALID_ARGUMENT");
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "VALIDATION_FAILED");
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        response.put("errors", errors);
        response.put("message", "Validation failed");
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(InvalidHierarchyException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidHierarchyException(InvalidHierarchyException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "INVALID_HIERARCHY");
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateResourceException(DuplicateResourceException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "DUPLICATE_RESOURCE");
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "ACCESS_DENIED");
        response.put("message", "Access denied: unauthorized for this hospital resource");
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        log.error("Unhandled server exception: ", ex);
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("code", "INTERNAL_SERVER_ERROR");
        String message = ex.getMessage();
        if (message == null || message.contains("http://") || message.contains("https://") || message.contains("FeignException") || message.contains("[400]") || message.contains("[500]")) {
            message = "An unexpected error occurred while processing your request. Please try again.";
        }
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        response.put("traceId", UUID.randomUUID().toString());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

