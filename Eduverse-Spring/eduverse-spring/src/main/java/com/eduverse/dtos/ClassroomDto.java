package com.eduverse.dtos;

import lombok.Data;

@Data
public class ClassroomDto {
    private Integer id;
    private String roomNumber;
    private String building;
    private int capacity;
}
