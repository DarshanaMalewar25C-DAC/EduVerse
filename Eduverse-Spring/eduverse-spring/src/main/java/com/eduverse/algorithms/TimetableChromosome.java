package com.eduverse.algorithms;

import com.eduverse.models.TimetableEntry;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class TimetableChromosome {
    private List<TimetableEntry> genes = new ArrayList<>();
    private double fitness;
    private int conflicts;

    public TimetableChromosome clone() {
        TimetableChromosome copy = new TimetableChromosome();
        copy.setGenes(this.genes.stream().map(g -> TimetableEntry.builder()
                .subjectId(g.getSubjectId())
                .teacherId(g.getTeacherId())
                .classroomId(g.getClassroomId())
                .timeSlotId(g.getTimeSlotId())
                .periodNumber(g.getPeriodNumber())
                .dayOfWeek(g.getDayOfWeek())
                .timetableId(g.getTimetableId())
                .build()).collect(Collectors.toList()));
        copy.setFitness(this.fitness);
        copy.setConflicts(this.conflicts);
        return copy;
    }
}
