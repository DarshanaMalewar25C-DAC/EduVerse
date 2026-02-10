package com.eduverse.repositories;

import com.eduverse.models.College;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CollegeRepository extends JpaRepository<College, Integer> {
    Optional<College> findByCollegeCode(String collegeCode);
}
