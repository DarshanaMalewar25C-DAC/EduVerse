package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.validator.constraints.Range;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Classrooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "college_id", "roomNumber" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", insertable = false, updatable = false)
    @JsonIgnore
    private College college;

    @Column(name = "college_id", nullable = false)
    private Integer collegeId;

    @Column(nullable = false, length = 50)
    private String roomNumber;

    @Column(nullable = false, length = 100)
    private String building;

    @Range(min = 1, max = 500)
    private int capacity;

    @Builder.Default
    @OneToMany(mappedBy = "classroom", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<TimetableEntry> timetableEntries = new ArrayList<>();
}
