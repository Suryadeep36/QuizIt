package com.example.quizit.exceptions;

import com.example.quizit.records.ApiError;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalException {


    Logger logger = LoggerFactory.getLogger(GlobalException.class);
    @ExceptionHandler({
            UsernameNotFoundException.class,
            BadCredentialsException.class,
            DisabledException.class
    })
    public ResponseEntity<ApiError> handleException(Exception e, HttpServletRequest request) {

        logger.error("Exception Class : {}", e.getClass().getName());
        ApiError apiError = ApiError.of(HttpStatus.BAD_REQUEST.value(),HttpStatus.BAD_REQUEST.name(), e.getMessage(), request.getRequestURI());
        return ResponseEntity.badRequest().body(apiError);
    }



    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex){
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, 404);

        return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handlerIllegalArgumentException(IllegalArgumentException ex){
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, 400);
        return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handlerRuntimeException(RuntimeException ex){
        ErrorResponse errorResponse = new ErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, 500);
        return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

}
