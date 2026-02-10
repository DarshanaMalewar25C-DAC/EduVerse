package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Timetables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", insertable = false, updatable = false)
    @JsonIgnore
    private Semester semester;

    @Column(name = "semester_id", nullable = false)
    private Integer semesterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    @JsonIgnore
    private Department department;

    @Column(name = "department_id", nullable = false)
    private Integer departmentId;

    @Builder.Default
    private int year = 1;

    @Builder.Default
    private LocalDateTime generatedDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by_user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User generatedBy;

    @Column(name = "generated_by_user_id", nullable = false)
    private Integer generatedByUserId;

    @Builder.Default
    @Column(length = 20)
    private String status = "Draft";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id", insertable = false, updatable = false)
    @JsonIgnore
    private User approvedBy;

    @Column(name = "approved_by_user_id")
    private Integer approvedByUserId;

    private LocalDateTime approvedDate;

    private Double optimizationScore;

    @Builder.Default
    private boolean isActive = false;

    @Builder.Default
    @OneToMany(mappedBy = "timetable", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TimetableEntry> entries = new ArrayList<>();
}
