package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.validator.constraints.Range;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Subjects", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "college_id", "code" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {
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
    private String name;

    @Column(nullable = false, length = 20)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    @JsonIgnore
    private Department department;

    @Column(name = "department_id", nullable = false)
    private Integer departmentId;

    @Range(min = 1, max = 10)
    private int credits;

    @Builder.Default
    @Range(min = 30, max = 180)
    private int durationMinutes = 60;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    @JsonIgnore
    private User teacher;

    @Column(name = "teacher_id")
    private Integer teacherId;

    @Builder.Default
    @Range(min = 1, max = 5)
    private int year = 1;

    @Builder.Default
    @Range(min = 1, max = 10)
    private int classesPerWeek = 5;

    @Builder.Default
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TimetableEntry> timetableEntries = new ArrayList<>();
}
