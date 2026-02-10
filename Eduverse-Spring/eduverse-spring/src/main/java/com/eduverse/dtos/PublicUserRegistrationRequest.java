package com.eduverse.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PublicUserRegistrationRequest extends UserRegistrationRequest {
    @NotNull
    private Integer collegeId;
}
