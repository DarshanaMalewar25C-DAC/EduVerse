package com.eduverse.config;

import com.eduverse.enums.RoleType;
import com.eduverse.models.College;
import com.eduverse.models.Role;
import com.eduverse.models.User;
import com.eduverse.repositories.CollegeRepository;
import com.eduverse.repositories.RoleRepository;
import com.eduverse.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private CollegeRepository collegeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedSuperAdmin();
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(1, "Admin", "College Administrator", null));
            roleRepository.save(new Role(2, "HOD", "Head of Department", null));
            roleRepository.save(new Role(3, "Teacher", "Department Teacher", null));
            roleRepository.save(new Role(4, "SuperAdmin", "System Super Administrator", null));
            System.out.println("Roles seeded successfully");
        }
    }

    private void seedSuperAdmin() {
        College superAdminCollege = collegeRepository.findByCollegeCode("SUPERADMIN")
                .orElse(College.builder()
                        .collegeName("EduVerse System")
                        .collegeCode("SUPERADMIN")
                        .address("System")
                        .state("System")
                        .createdAt(LocalDateTime.now())
                        .build());

        superAdminCollege.setActive(true);
        superAdminCollege.setApproved(true);
        superAdminCollege = collegeRepository.save(superAdminCollege);

        Role superAdminRole = roleRepository.findById(RoleType.SUPERADMIN.getValue()).orElseThrow();

        createOrUpdateSuperAdmin("superadmin1@eduverse.com", "Super Admin 1", superAdminCollege, superAdminRole);
        createOrUpdateSuperAdmin("superadmin2@eduverse.com", "Super Admin 2", superAdminCollege, superAdminRole);

        System.out.println("SuperAdmin users verified/seeded successfully");
    }

    private void createOrUpdateSuperAdmin(String email, String name, College college, Role role) {
        User user = userRepository.findByEmail(email)
                .orElse(User.builder()
                        .email(email)
                        .createdAt(LocalDateTime.now())
                        .build());

        user.setCollege(college);
        user.setCollegeId(college.getId());
        user.setFullName(name);
        if (user.getPasswordHash() == null) {
            user.setPasswordHash(passwordEncoder.encode("SuperAdmin@123"));
        }
        user.setRole(role);
        user.setRoleId(role.getId());
        user.setActive(true);
        user.setApproved(true);
        user.setEmailVerified(true);

        userRepository.save(user);
    }
}
