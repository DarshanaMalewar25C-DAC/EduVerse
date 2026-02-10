package com.eduverse.repositories;

import com.eduverse.models.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Integer> {
    List<TimetableEntry> findByTimetableId(Integer timetableId);
}
