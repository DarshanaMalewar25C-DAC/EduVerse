package com.eduverse.repositories;

import com.eduverse.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    List<Subject> findByCollegeId(Integer collegeId);

    List<Subject> findByDepartmentId(Integer departmentId);

    List<Subject> findByDepartmentIdAndYear(Integer departmentId, int year);
}
