package com.eduverse.algorithms;

import com.eduverse.models.Subject;
import com.eduverse.models.User;
import com.eduverse.models.Classroom;
import com.eduverse.models.TimeSlot;
import com.eduverse.models.TimetableEntry;
import java.util.*;
import java.util.stream.Collectors;

public class GeneticAlgorithm {
    private final List<Subject> subjects;
    private final List<User> teachers;
    private final List<Classroom> classrooms;
    private final TimeSlot shift;
    private final List<TimetableEntry> existingEntries;
    private final Random random = new Random();

    private static final int POPULATION_SIZE = 100;
    private static final int MAX_GENERATIONS = 200;
    private static final double MUTATION_RATE = 0.15;
    private static final double CROSSOVER_RATE = 0.85;
    private static final int ELITE_COUNT = 5;
    private static final int TOURNAMENT_SIZE = 5;

    private final String[] days = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
    private final List<Integer> availablePeriods;

    public GeneticAlgorithm(
            List<Subject> subjects,
            List<User> teachers,
            List<Classroom> classrooms,
            TimeSlot shift,
            List<TimetableEntry> existingEntries) {
        this.subjects = subjects;
        this.teachers = teachers;
        this.classrooms = classrooms;
        this.shift = shift;
        this.existingEntries = existingEntries;

        this.availablePeriods = new ArrayList<>();
        for (int i = 1; i <= shift.getTotalPeriods(); i++) {
            availablePeriods.add(i);
        }
    }

    public TimetableChromosome run() {
        List<TimetableChromosome> population = initializePopulation();

        TimetableChromosome bestOverall = null;
        int stagnantGenerations = 0;

        for (int gen = 0; gen < MAX_GENERATIONS; gen++) {
            evaluatePopulation(population);

            TimetableChromosome currentBest = population.stream()
                    .max(Comparator.comparingDouble(TimetableChromosome::getFitness))
                    .orElse(population.get(0));

            if (bestOverall == null || currentBest.getFitness() > bestOverall.getFitness()) {
                bestOverall = currentBest.clone();
                stagnantGenerations = 0;
            } else {
                stagnantGenerations++;
            }

            if (currentBest.getConflicts() == 0 && currentBest.getFitness() > 95) {
                break;
            }

            if (stagnantGenerations > 30) {
                population = reinitializeWithElites(population);
                stagnantGenerations = 0;
            }

            List<TimetableChromosome> nextGeneration = new ArrayList<>();

            List<TimetableChromosome> elites = population.stream()
                    .sorted((c1, c2) -> Double.compare(c2.getFitness(), c1.getFitness()))
                    .limit(ELITE_COUNT)
                    .map(TimetableChromosome::clone)
                    .collect(Collectors.toList());
            nextGeneration.addAll(elites);

            while (nextGeneration.size() < POPULATION_SIZE) {
                TimetableChromosome p1 = tournamentSelect(population);
                TimetableChromosome p2 = tournamentSelect(population);

                TimetableChromosome c1, c2;
                if (random.nextDouble() < CROSSOVER_RATE) {
                    List<TimetableChromosome> children = subjectBasedCrossover(p1, p2);
                    c1 = children.get(0);
                    c2 = children.get(1);
                } else {
                    c1 = p1.clone();
                    c2 = p2.clone();
                }

                mutate(c1);
                if (nextGeneration.size() + 1 < POPULATION_SIZE) {
                    mutate(c2);
                    nextGeneration.add(c2);
                }
                nextGeneration.add(c1);
            }

            population = nextGeneration;
        }

        evaluatePopulation(population);
        return population.stream()
                .max(Comparator.comparingDouble(TimetableChromosome::getFitness))
                .orElse(bestOverall);
    }

    private List<TimetableChromosome> initializePopulation() {
        List<TimetableChromosome> pop = new ArrayList<>();

        for (int i = 0; i < POPULATION_SIZE; i++) {
            TimetableChromosome chromo = new TimetableChromosome();

            for (Subject subject : subjects) {
                int required = subject.getClassesPerWeek();
                int attempts = 0;
                int scheduled = 0;

                while (scheduled < required && attempts < 100) {
                    TimetableEntry entry = createRandomEntry(subject, chromo.getGenes());
                    if (entry != null) {
                        chromo.getGenes().add(entry);
                        scheduled++;
                    }
                    attempts++;
                }
            }

            pop.add(chromo);
        }

        return pop;
    }

    private TimetableEntry createRandomEntry(Subject subject, List<TimetableEntry> currentGenes) {
        for (int attempt = 0; attempt < 50; attempt++) {
            String day = days[random.nextInt(days.length)];
            int period = availablePeriods.get(random.nextInt(availablePeriods.size()));

            if (currentGenes.stream().anyMatch(g -> g.getDayOfWeek().equals(day) && g.getPeriodNumber() == period))
                continue;

            User teacher = selectTeacher(subject, currentGenes, day, period);
            if (teacher == null)
                continue;

            Classroom classroom = selectClassroom(subject, currentGenes, day, period);
            if (classroom == null)
                continue;

            return TimetableEntry.builder()
                    .subjectId(subject.getId())
                    .teacherId(teacher.getId())
                    .classroomId(classroom.getId())
                    .timeSlotId(shift.getId())
                    .periodNumber(period)
                    .dayOfWeek(day)
                    .build();
        }

        return null;
    }

    private User selectTeacher(Subject subject, List<TimetableEntry> currentGenes, String day, int period) {
        if (subject.getTeacherId() != null) {
            User assignedTeacher = teachers.stream()
                    .filter(u -> u.getId().equals(subject.getTeacherId()))
                    .findFirst().orElse(null);
            if (assignedTeacher != null) {
                if (!isTeacherBusy(assignedTeacher.getId(), day, period, currentGenes)) {
                    return assignedTeacher;
                }
            }
        }

        List<User> deptTeachers = teachers.stream()
                .filter(t -> t.getDepartmentId() != null && t.getDepartmentId().equals(subject.getDepartmentId()))
                .collect(Collectors.toList());

        List<User> availableTeachers = deptTeachers.stream()
                .filter(t -> !isTeacherBusy(t.getId(), day, period, currentGenes))
                .collect(Collectors.toList());

        if (!availableTeachers.isEmpty()) {
            return availableTeachers.get(random.nextInt(availableTeachers.size()));
        }

        return null;
    }

    private Classroom selectClassroom(Subject subject, List<TimetableEntry> currentGenes, String day, int period) {
        List<Classroom> availableClassrooms = classrooms.stream()
                .filter(c -> !isClassroomBusy(c.getId(), day, period, currentGenes))
                .collect(Collectors.toList());

        if (!availableClassrooms.isEmpty()) {
            return availableClassrooms.get(random.nextInt(availableClassrooms.size()));
        }

        return null;
    }

    private boolean isTeacherBusy(Integer teacherId, String day, int period, List<TimetableEntry> currentGenes) {
        if (currentGenes.stream().anyMatch(g -> g.getTeacherId().equals(teacherId) && g.getDayOfWeek().equals(day)
                && g.getPeriodNumber() == period))
            return true;

        if (existingEntries.stream().anyMatch(e -> e.getTeacherId().equals(teacherId) && e.getDayOfWeek().equals(day)
                && e.getPeriodNumber() == period && e.getTimeSlotId().equals(shift.getId())))
            return true;

        return false;
    }

    private boolean isClassroomBusy(Integer classroomId, String day, int period, List<TimetableEntry> currentGenes) {
        if (currentGenes.stream().anyMatch(g -> g.getClassroomId().equals(classroomId) && g.getDayOfWeek().equals(day)
                && g.getPeriodNumber() == period))
            return true;

        if (existingEntries.stream()
                .anyMatch(e -> e.getClassroomId().equals(classroomId) && e.getDayOfWeek().equals(day)
                        && e.getPeriodNumber() == period && e.getTimeSlotId().equals(shift.getId())))
            return true;

        return false;
    }

    private void evaluatePopulation(List<TimetableChromosome> population) {
        for (TimetableChromosome chromo : population) {
            int conflicts = 0;
            double fitness = 100.0;

            // Duplicate Slots
            long duplicateSlots = chromo.getGenes().stream()
                    .collect(Collectors.groupingBy(g -> g.getDayOfWeek() + "-" + g.getPeriodNumber(),
                            Collectors.counting()))
                    .values().stream().filter(count -> count > 1)
                    .mapToLong(count -> count - 1).sum();
            conflicts += duplicateSlots;

            // Teacher Conflicts
            long teacherConflicts = chromo.getGenes().stream()
                    .collect(Collectors.groupingBy(
                            g -> g.getTeacherId() + "-" + g.getDayOfWeek() + "-" + g.getPeriodNumber(),
                            Collectors.counting()))
                    .values().stream().filter(count -> count > 1)
                    .mapToLong(count -> count - 1).sum();
            conflicts += teacherConflicts;

            // Classroom Conflicts
            long classroomConflicts = chromo.getGenes().stream()
                    .collect(Collectors.groupingBy(
                            g -> g.getClassroomId() + "-" + g.getDayOfWeek() + "-" + g.getPeriodNumber(),
                            Collectors.counting()))
                    .values().stream().filter(count -> count > 1)
                    .mapToLong(count -> count - 1).sum();
            conflicts += classroomConflicts;

            // Global Teacher Conflicts
            long globalTeacherConflicts = chromo.getGenes().stream()
                    .filter(gene -> existingEntries.stream()
                            .anyMatch(e -> e.getTeacherId().equals(gene.getTeacherId()) &&
                                    e.getDayOfWeek().equals(gene.getDayOfWeek()) &&
                                    e.getPeriodNumber() == gene.getPeriodNumber() &&
                                    e.getTimeSlotId().equals(shift.getId())))
                    .count();
            conflicts += globalTeacherConflicts;

            // Global Classroom Conflicts
            long globalClassroomConflicts = chromo.getGenes().stream()
                    .filter(gene -> existingEntries.stream()
                            .anyMatch(e -> e.getClassroomId().equals(gene.getClassroomId()) &&
                                    e.getDayOfWeek().equals(gene.getDayOfWeek()) &&
                                    e.getPeriodNumber() == gene.getPeriodNumber() &&
                                    e.getTimeSlotId().equals(shift.getId())))
                    .count();
            conflicts += globalClassroomConflicts;

            chromo.setConflicts(conflicts);
            fitness -= (conflicts * 15);

            // Multiple Subjects Per Day
            long multipleSubjectsPerDay = chromo.getGenes().stream()
                    .collect(Collectors.groupingBy(g -> g.getDayOfWeek() + "-" + g.getSubjectId(),
                            Collectors.counting()))
                    .values().stream().filter(count -> count > 1)
                    .mapToLong(count -> (count - 1) * 3).sum();
            fitness -= multipleSubjectsPerDay;

            // Teacher Workload
            Map<Integer, Map<String, Long>> teacherDailyWorkload = chromo.getGenes().stream()
                    .collect(Collectors.groupingBy(TimetableEntry::getTeacherId,
                            Collectors.groupingBy(TimetableEntry::getDayOfWeek, Collectors.counting())));

            for (Map<String, Long> dailyLoads : teacherDailyWorkload.values()) {
                for (Long load : dailyLoads.values()) {
                    if (load > 4)
                        fitness -= (load - 4) * 5;
                    if (load == 0)
                        fitness += 2;
                }
            }

            // Daily Distribution Variance
            List<Long> dailyCounts = new ArrayList<>();
            for (String day : days) {
                long count = chromo.getGenes().stream().filter(g -> g.getDayOfWeek().equals(day)).count();
                dailyCounts.add(count);
            }

            if (!dailyCounts.isEmpty()) {
                double avg = dailyCounts.stream().mapToDouble(Long::doubleValue).average().orElse(0.0);
                double variance = dailyCounts.stream().mapToDouble(d -> Math.pow(d - avg, 2)).average().orElse(0.0);
                fitness -= variance * 0.5;
            }

            // Subject Completion
            for (Subject s : subjects) {
                long scheduled = chromo.getGenes().stream().filter(g -> g.getSubjectId().equals(s.getId())).count();
                int required = s.getClassesPerWeek();
                fitness -= Math.abs(scheduled - required) * 10;
            }

            // Gaps in schedule
            int dailyGaps = 0;
            for (String day : days) {
                List<TimetableEntry> dayGenes = chromo.getGenes().stream()
                        .filter(g -> g.getDayOfWeek().equals(day))
                        .sorted(Comparator.comparingInt(TimetableEntry::getPeriodNumber))
                        .collect(Collectors.toList());

                if (!dayGenes.isEmpty()) {
                    // Morning Gaps
                    if (dayGenes.get(0).getPeriodNumber() > 1) {
                        dailyGaps += (dayGenes.get(0).getPeriodNumber() - 1);
                    }

                    // Internal Gaps
                    for (int i = 0; i < dayGenes.size() - 1; i++) {
                        int gap = dayGenes.get(i + 1).getPeriodNumber() - dayGenes.get(i).getPeriodNumber() - 1;
                        if (gap > 0) {
                            dailyGaps += gap;
                        }
                    }
                }
            }
            fitness -= dailyGaps * 25;

            chromo.setFitness(Math.max(0, fitness));
        }
    }

    private TimetableChromosome tournamentSelect(List<TimetableChromosome> pop) {
        List<TimetableChromosome> tournament = new ArrayList<>();
        for (int i = 0; i < TOURNAMENT_SIZE; i++) {
            tournament.add(pop.get(random.nextInt(pop.size())));
        }
        return tournament.stream().max(Comparator.comparingDouble(TimetableChromosome::getFitness)).orElse(pop.get(0));
    }

    private List<TimetableChromosome> subjectBasedCrossover(TimetableChromosome p1, TimetableChromosome p2) {
        TimetableChromosome c1 = new TimetableChromosome();
        TimetableChromosome c2 = new TimetableChromosome();

        List<Integer> subjectIds = subjects.stream().map(Subject::getId).collect(Collectors.toList());
        int splitPoint = random.nextInt(subjectIds.size());

        Set<Integer> c1Subjects = new HashSet<>(subjectIds.subList(0, splitPoint));
        Set<Integer> c2Subjects = new HashSet<>(subjectIds.subList(splitPoint, subjectIds.size()));

        for (TimetableEntry gene : p1.getGenes()) {
            if (c1Subjects.contains(gene.getSubjectId())) {
                c1.getGenes().add(cloneGene(gene));
            } else {
                c2.getGenes().add(cloneGene(gene));
            }
        }

        for (TimetableEntry gene : p2.getGenes()) {
            if (c2Subjects.contains(gene.getSubjectId())) {
                c1.getGenes().add(cloneGene(gene));
            } else {
                c2.getGenes().add(cloneGene(gene));
            }
        }

        return Arrays.asList(c1, c2);
    }

    private void mutate(TimetableChromosome chromo) {
        for (int i = 0; i < chromo.getGenes().size(); i++) {
            if (random.nextDouble() < MUTATION_RATE) {
                TimetableEntry gene = chromo.getGenes().get(i);
                int mutationType = random.nextInt(4);

                switch (mutationType) {
                    case 0:
                        mutateTimeSlot(gene, chromo.getGenes());
                        break;
                    case 1:
                        mutateTeacher(gene, chromo.getGenes());
                        break;
                    case 2:
                        mutateClassroom(gene, chromo.getGenes());
                        break;
                    case 3:
                        swapGenes(chromo);
                        break;
                }
            }
        }
    }

    private void mutateTimeSlot(TimetableEntry gene, List<TimetableEntry> allGenes) {
        for (int attempt = 0; attempt < 20; attempt++) {
            String newDay = days[random.nextInt(days.length)];
            int newPeriod = availablePeriods.get(random.nextInt(availablePeriods.size()));

            if (allGenes.stream()
                    .noneMatch(g -> g != gene && g.getDayOfWeek().equals(newDay) && g.getPeriodNumber() == newPeriod)) {
                if (!isTeacherBusy(gene.getTeacherId(), newDay, newPeriod,
                        allGenes.stream().filter(g -> g != gene).collect(Collectors.toList())) &&
                        !isClassroomBusy(gene.getClassroomId(), newDay, newPeriod,
                                allGenes.stream().filter(g -> g != gene).collect(Collectors.toList()))) {
                    gene.setDayOfWeek(newDay);
                    gene.setPeriodNumber(newPeriod);
                    break;
                }
            }
        }
    }

    private void mutateTeacher(TimetableEntry gene, List<TimetableEntry> allGenes) {
        Subject subject = subjects.stream().filter(s -> s.getId().equals(gene.getSubjectId())).findFirst().orElse(null);
        if (subject != null) {
            User newTeacher = selectTeacher(subject,
                    allGenes.stream().filter(g -> g != gene).collect(Collectors.toList()), gene.getDayOfWeek(),
                    gene.getPeriodNumber());
            if (newTeacher != null) {
                gene.setTeacherId(newTeacher.getId());
            }
        }
    }

    private void mutateClassroom(TimetableEntry gene, List<TimetableEntry> allGenes) {
        Subject subject = subjects.stream().filter(s -> s.getId().equals(gene.getSubjectId())).findFirst().orElse(null);
        if (subject != null) {
            Classroom newClassroom = selectClassroom(subject,
                    allGenes.stream().filter(g -> g != gene).collect(Collectors.toList()), gene.getDayOfWeek(),
                    gene.getPeriodNumber());
            if (newClassroom != null) {
                gene.setClassroomId(newClassroom.getId());
            }
        }
    }

    private void swapGenes(TimetableChromosome chromo) {
        if (chromo.getGenes().size() < 2)
            return;

        TimetableEntry gene1 = chromo.getGenes().get(random.nextInt(chromo.getGenes().size()));
        TimetableEntry gene2 = chromo.getGenes().get(random.nextInt(chromo.getGenes().size()));

        if (gene1 != gene2) {
            String tempDay = gene1.getDayOfWeek();
            int tempPeriod = gene1.getPeriodNumber();

            gene1.setDayOfWeek(gene2.getDayOfWeek());
            gene1.setPeriodNumber(gene2.getPeriodNumber());

            gene2.setDayOfWeek(tempDay);
            gene2.setPeriodNumber(tempPeriod);
        }
    }

    private List<TimetableChromosome> reinitializeWithElites(List<TimetableChromosome> population) {
        List<TimetableChromosome> elites = population.stream()
                .sorted((c1, c2) -> Double.compare(c2.getFitness(), c1.getFitness()))
                .limit(ELITE_COUNT)
                .map(TimetableChromosome::clone)
                .collect(Collectors.toList());

        List<TimetableChromosome> newPop = initializePopulation();

        for (int i = 0; i < ELITE_COUNT && i < newPop.size(); i++) {
            newPop.set(i, elites.get(i));
        }

        return newPop;
    }

    private TimetableEntry cloneGene(TimetableEntry g) {
        return TimetableEntry.builder()
                .subjectId(g.getSubjectId())
                .teacherId(g.getTeacherId())
                .classroomId(g.getClassroomId())
                .timeSlotId(g.getTimeSlotId())
                .periodNumber(g.getPeriodNumber())
                .dayOfWeek(g.getDayOfWeek())
                .timetableId(g.getTimetableId())
                .build();
    }
}
