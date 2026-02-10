package com.eduverse.repositories;

import com.eduverse.models.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {
    List<TimeSlot> findByCollegeId(Integer collegeId);

    List<TimeSlot> findByCollegeIdAndYear(Integer collegeId, int year);
}
