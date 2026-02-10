package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", insertable = false, updatable = false)
    @JsonIgnore
    private College college;

    @Column(name = "college_id", nullable = false)
    private Integer collegeId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    @JsonIgnore
    private Department department;

    @Column(name = "department_id")
    private Integer departmentId;

    @Column(length = 50)
    private String designation;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean isApproved = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastLogin;

    private String passwordResetToken;

    private LocalDateTime passwordResetTokenExpiry;

    private String otpCode;

    private LocalDateTime otpExpiry;

    @Builder.Default
    private boolean isEmailVerified = false;

    @Builder.Default
    @OneToMany(mappedBy = "generatedBy", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Timetable> generatedTimetables = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "approvedBy", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Timetable> approvedTimetables = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TimetableEntry> timetableEntries = new ArrayList<>();
}
