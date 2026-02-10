package com.eduverse.repositories;

import com.eduverse.models.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Integer> {
    List<Semester> findByCollegeId(Integer collegeId);
}
