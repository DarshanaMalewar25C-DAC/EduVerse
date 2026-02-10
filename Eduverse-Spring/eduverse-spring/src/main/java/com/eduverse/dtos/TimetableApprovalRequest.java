package com.eduverse.dtos;

import lombok.Data;

@Data
public class TimetableApprovalRequest {
    private Integer timetableId;
    private boolean approve;
}
