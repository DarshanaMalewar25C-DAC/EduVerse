package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Colleges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class College {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String collegeName;

    @Column(nullable = false, length = 20, unique = true)
    private String collegeCode;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String contactEmail;

    @Column(length = 20)
    private String contactPhone;

    private Integer establishedYear;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean isApproved = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<User> users = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Department> departments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Classroom> classrooms = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Subject> subjects = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Semester> semesters = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TimeSlot> timeSlots = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Timetable> timetables = new ArrayList<>();
}
