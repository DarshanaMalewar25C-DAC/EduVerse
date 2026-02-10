package com.eduverse.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApprovalRequest {
    @NotNull
    private Integer id;

    @NotNull
    private boolean approve;

    private String reason;
}
