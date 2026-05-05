package com.rideapp.exception;
public class ServiceUnavailableException extends RuntimeException {

    private static final String READ_ONLY_MODE = "READ_ONLY";

    public ServiceUnavailableException(String message) {
        super(message);
    }

    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }

    public String getMode() {
        return READ_ONLY_MODE;
    }
}