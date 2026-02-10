package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "TimeSlots", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "college_id", "year", "shift" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", insertable = false, updatable = false)
    @JsonIgnore
    private College college;

    @Column(name = "college_id", nullable = false)
    private Integer collegeId;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String shift = "Morning";

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Builder.Default
    private int periodDurationMinutes = 60;

    @Builder.Default
    private int year = 1;

    @Builder.Default
    private int breakDurationMinutes = 15;

    @Builder.Default
    private int breakAfterPeriod = 3;

    private int totalPeriods;

    @Builder.Default
    @OneToMany(mappedBy = "timeSlot", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TimetableEntry> timetableEntries = new ArrayList<>();
}
