package com.eduverse.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PendingApprovalResponse {
    private Integer id;
    private String name;
    private String email;
    private String collegeName;
    private String collegeCode;
    private String address;
    private String state;
    private String contactEmail;
    private String contactPhone;
    private Integer establishedYear;
    private String adminName;
    private String role;
    private LocalDateTime createdAt;
}
