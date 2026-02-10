package com.eduverse.services;

import com.eduverse.dtos.CreateTimeSlotDto;
import com.eduverse.dtos.TimeSlotDto;
import com.eduverse.dtos.UpdateTimeSlotDto;
import com.eduverse.dtos.ServiceResponse;
import java.util.List;

public interface ITimeSlotService {
    List<TimeSlotDto> getTimeSlotsByCollege(Integer collegeId);

    ServiceResponse<TimeSlotDto> createTimeSlot(CreateTimeSlotDto dto, Integer collegeId);

    ServiceResponse<Void> updateTimeSlot(Integer id, UpdateTimeSlotDto dto, Integer collegeId);

    boolean deleteTimeSlot(Integer id, Integer collegeId);

    TimeSlotDto getTimeSlotById(Integer id, Integer collegeId);
}
