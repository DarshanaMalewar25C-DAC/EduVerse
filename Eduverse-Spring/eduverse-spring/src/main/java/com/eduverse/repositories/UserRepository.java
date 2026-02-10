package com.eduverse.repositories;

import com.eduverse.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    List<User> findByCollegeId(Integer collegeId);

    boolean existsByEmail(String email);

    Optional<User> findByPasswordResetToken(String token);
}
