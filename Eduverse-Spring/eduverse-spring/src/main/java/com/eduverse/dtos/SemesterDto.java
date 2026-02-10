package com.eduverse.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SemesterDto {
    private Integer id;
    private String name;
    private String code;
    private LocalDate startDate;
    private LocalDate endDate;

}
