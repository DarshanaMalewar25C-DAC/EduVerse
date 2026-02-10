package com.eduverse.models;

import org.hibernate.validator.constraints.Range;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TimetableEntries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_id", insertable = false, updatable = false)
    private Timetable timetable;

    @Column(name = "timetable_id", nullable = false)
    private Integer timetableId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", insertable = false, updatable = false)
    private Subject subject;

    @Column(name = "subject_id", nullable = false)
    private Integer subjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", insertable = false, updatable = false)
    private User teacher;

    @Column(name = "teacher_id", nullable = false)
    private Integer teacherId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", insertable = false, updatable = false)
    private Classroom classroom;

    @Column(name = "classroom_id", nullable = false)
    private Integer classroomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id", insertable = false, updatable = false)
    private TimeSlot timeSlot;

    @Column(name = "time_slot_id", nullable = false)
    private Integer timeSlotId;

    @Range(min = 1, max = 6)
    private int periodNumber;

    @Column(nullable = false, length = 20)
    private String dayOfWeek;

}
