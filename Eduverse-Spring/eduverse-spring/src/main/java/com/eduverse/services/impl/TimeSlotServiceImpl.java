package com.eduverse.services.impl;

import com.eduverse.dtos.CreateTimeSlotDto;
import com.eduverse.dtos.TimeSlotDto;
import com.eduverse.dtos.UpdateTimeSlotDto;
import com.eduverse.dtos.ServiceResponse;
import com.eduverse.models.TimeSlot;
import com.eduverse.repositories.TimeSlotRepository;
import com.eduverse.services.ITimeSlotService;
import com.eduverse.services.ITimetableValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TimeSlotServiceImpl implements ITimeSlotService {
    @Autowired
    private TimeSlotRepository timeSlotRepository;
    @Autowired
    private ITimetableValidationService validationService;

    @Override
    public List<TimeSlotDto> getTimeSlotsByCollege(Integer collegeId) {
        return timeSlotRepository.findByCollegeId(collegeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse<TimeSlotDto> createTimeSlot(CreateTimeSlotDto dto, Integer collegeId) {
        TimeSlot timeSlot = TimeSlot.builder()
                .collegeId(collegeId)
                .shift(dto.getShift())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .periodDurationMinutes(dto.getPeriodDurationMinutes())
                .breakDurationMinutes(dto.getBreakDurationMinutes())
                .breakAfterPeriod(dto.getBreakAfterPeriod())
                .year(dto.getYear())
                .build();

        int periods = validationService.calculateTotalPeriods(timeSlot);
        timeSlot.setTotalPeriods(periods);

        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return ServiceResponse.success("TimeSlot created successfully", mapToDto(saved));
    }

    @Override
    @Transactional
    public ServiceResponse<Void> updateTimeSlot(Integer id, UpdateTimeSlotDto dto, Integer collegeId) {
        Optional<TimeSlot> timeSlotOpt = timeSlotRepository.findById(id);
        if (timeSlotOpt.isEmpty() || !timeSlotOpt.get().getCollegeId().equals(collegeId))
            return ServiceResponse.failure("TimeSlot not found.");

        TimeSlot timeSlot = timeSlotOpt.get();
        timeSlot.setShift(dto.getShift());
        timeSlot.setStartTime(dto.getStartTime());
        timeSlot.setEndTime(dto.getEndTime());
        timeSlot.setPeriodDurationMinutes(dto.getPeriodDurationMinutes());
        timeSlot.setBreakDurationMinutes(dto.getBreakDurationMinutes());
        timeSlot.setBreakAfterPeriod(dto.getBreakAfterPeriod());
        timeSlot.setYear(dto.getYear());

        int periods = validationService.calculateTotalPeriods(timeSlot);
        timeSlot.setTotalPeriods(periods);

        timeSlotRepository.save(timeSlot);
        return ServiceResponse.success("TimeSlot updated successfully", null);
    }

    @Override
    @Transactional
    public boolean deleteTimeSlot(Integer id, Integer collegeId) {
        Optional<TimeSlot> timeSlotOpt = timeSlotRepository.findById(id);
        if (timeSlotOpt.isPresent() && timeSlotOpt.get().getCollegeId().equals(collegeId)) {
            timeSlotRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public TimeSlotDto getTimeSlotById(Integer id, Integer collegeId) {
        return timeSlotRepository.findById(id)
                .filter(t -> t.getCollegeId().equals(collegeId))
                .map(this::mapToDto)
                .orElse(null);
    }

    private TimeSlotDto mapToDto(TimeSlot t) {
        TimeSlotDto dto = new TimeSlotDto();
        dto.setId(t.getId());
        dto.setShift(t.getShift());
        dto.setStartTime(t.getStartTime());
        dto.setEndTime(t.getEndTime());
        dto.setPeriodDurationMinutes(t.getPeriodDurationMinutes());
        dto.setBreakDurationMinutes(t.getBreakDurationMinutes());
        dto.setBreakAfterPeriod(t.getBreakAfterPeriod());
        dto.setYear(t.getYear());
        return dto;
    }
}
