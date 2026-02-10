package com.eduverse.repositories;

import com.eduverse.models.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Integer> {
    List<Timetable> findByCollegeId(Integer collegeId);

    List<Timetable> findBySemesterId(Integer semesterId);
}
