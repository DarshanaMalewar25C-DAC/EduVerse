package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Departments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "college_id", "code" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
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

    @Column(nullable = false, length = 10)
    private String code;

    @Builder.Default
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Subject> subjects = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<User> users = new ArrayList<>();
}
