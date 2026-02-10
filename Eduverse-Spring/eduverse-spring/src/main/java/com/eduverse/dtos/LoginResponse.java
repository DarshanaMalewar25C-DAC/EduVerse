package com.eduverse.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Integer userId;
    private String fullName;
    private String email;
    private String role;
    private Integer roleId;
    private Integer collegeId;
    private String collegeName;
    private String collegeCode;
    private Integer departmentId;
    private boolean requires2FA;
}
