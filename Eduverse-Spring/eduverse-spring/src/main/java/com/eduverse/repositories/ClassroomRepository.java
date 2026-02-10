package com.eduverse.repositories;

import com.eduverse.models.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Integer> {
    List<Classroom> findByCollegeId(Integer collegeId);
}
