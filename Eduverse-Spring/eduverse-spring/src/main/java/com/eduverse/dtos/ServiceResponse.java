package com.eduverse.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ServiceResponse<T> success(String message, T data) {
        return new ServiceResponse<>(true, message, data);
    }

    public static <T> ServiceResponse<T> failure(String message) {
        return new ServiceResponse<>(false, message, null);
    }
}
