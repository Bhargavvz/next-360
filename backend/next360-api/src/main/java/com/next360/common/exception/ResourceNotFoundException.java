package com.next360.common.exception;

/**
 * Thrown when a requested resource is not found.
 */
public class ResourceNotFoundException extends Next360Exception {

    public ResourceNotFoundException(String resourceType, String identifier) {
        super(
                resourceType.toUpperCase() + "_NOT_FOUND",
                resourceType + " not found: " + identifier,
                404
        );
    }
}
