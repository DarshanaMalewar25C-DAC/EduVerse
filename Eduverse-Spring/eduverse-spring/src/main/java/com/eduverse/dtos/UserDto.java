package com.eduverse.dtos;

import lombok.Data;

@Data
public class UserDto {
    private Integer id;
    private String fullName;
    private String email;
    private Integer roleId;
    private String roleName;
    private Integer departmentId;
    private String departmentName;
    private String designation;
    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;
}
