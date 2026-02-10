package com.eduverse.dtos;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class ValidationResult {
    private boolean isValid = true;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
}
