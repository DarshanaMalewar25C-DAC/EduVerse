package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Semesters", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "college_id", "code" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester {
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

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Timetable> timetables = new ArrayList<>();
}
