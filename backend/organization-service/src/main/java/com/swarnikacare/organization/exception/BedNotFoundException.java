package com.swarnikacare.organization.exception;

public class BedNotFoundException extends RuntimeException {
    public BedNotFoundException(String message) {
        super(message);
    }
}
