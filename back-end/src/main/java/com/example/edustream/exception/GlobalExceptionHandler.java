package com.example.edustream.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {


	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
		Map<String, String> errors = new HashMap<>();

		ex.getBindingResult().getAllErrors().forEach((error) -> {
			String fieldName = ((FieldError) error).getField();
			String errorMessage = error.getDefaultMessage();
			errors.put(fieldName, errorMessage);
		});
		return ResponseEntity.status(400).body(errors);
	}


	@ExceptionHandler(exception = NotMatchingOtpException.class)
	public ResponseEntity<?> handleNotMatchingOtpException(NotMatchingOtpException ex) {

		var response = responseMessage(400, "bad request", ex.getMessage());

		return ResponseEntity.status(400).body(response);

	}

	@ExceptionHandler(exception = ExpiredOtpException.class)

	public ResponseEntity<?> handleExpiredOtpException(ExpiredOtpException ex) {

		var response = responseMessage(400, "bad request", ex.getMessage());

		return ResponseEntity.status(400).body(response);

	}

	@ExceptionHandler(exception = EmailAlreadyExistsException.class)
	public ResponseEntity<?> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex) {
		var response = responseMessage(400, "bad request", ex.getMessage());

		return ResponseEntity.status(400).body(response);
	}

	@ExceptionHandler(exception = NotMatchingRefreshTokenException.class)

	public ResponseEntity<?> handleNotMatchingRefreshTokenException(NotMatchingRefreshTokenException ex) {
		var response = responseMessage(400, "bad request", ex.getMessage());

		return ResponseEntity.status(400).body(response);
	}

	@ExceptionHandler(exception = UsernameAlreadyExistsException.class)
	public ResponseEntity<?> handleUsernameAlreadyExistsException(UsernameAlreadyExistsException ex) {
		var response = responseMessage(400, "bad request", ex.getMessage());

		return ResponseEntity.status(400).body(response);
	}
	@ExceptionHandler(exception = UsernameChangeCooldownException.class)
	public ResponseEntity<?> handleUsernameChangeCooldownException(UsernameChangeCooldownException ex) {
		var response = responseMessage(400, "bad request", ex.getMessage());

		return ResponseEntity.status(400).body(response);
	}

	private Map<String, Object> responseMessage(int status, String error, String message) {

		Map<String, Object> response = new HashMap<>();

		response.put("status", status);
		response.put("error", error);
		response.put("message", message);

		return response;

	}

}
