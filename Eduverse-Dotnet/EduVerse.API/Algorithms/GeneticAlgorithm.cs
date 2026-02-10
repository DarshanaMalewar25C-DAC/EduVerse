using EduVerse.API.Models;
using System.Linq;

namespace EduVerse.API.Algorithms
{
    public class GeneticAlgorithm
    {
        private readonly List<Subject> _subjects;
        private readonly List<User> _teachers;
        private readonly List<Classroom> _classrooms;
        private readonly TimeSlot _shift;
        private readonly List<TimetableEntry> _existingEntries;
        private readonly Random _random = new Random();

        private const int PopulationSize = 100;
        private const int MaxGenerations = 200;
        private const double MutationRate = 0.15;
        private const double CrossoverRate = 0.85;
        private const int EliteCount = 5;
        private const int TournamentSize = 5;

        private readonly string[] _days = { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
        private readonly List<int> _availablePeriods;

        public GeneticAlgorithm(
            List<Subject> subjects,
            List<User> teachers,
            List<Classroom> classrooms,
            TimeSlot shift,
            List<TimetableEntry> existingEntries)
        {
            _subjects = subjects;
            _teachers = teachers;
            _classrooms = classrooms;
            _shift = shift;
            _existingEntries = existingEntries;

            _availablePeriods = Enumerable.Range(1, shift.TotalPeriods).ToList();
        }

        public async Task<TimetableChromosome> RunAsync()
        {
            var population = InitializePopulation();

            TimetableChromosome? bestOverall = null;
            int stagnantGenerations = 0;

            for (int gen = 0; gen < MaxGenerations; gen++)
            {
                EvaluatePopulation(population);
                
                var currentBest = population.OrderByDescending(c => c.Fitness).First();
                
                if (bestOverall == null || currentBest.Fitness > bestOverall.Fitness)
                {
                    bestOverall = currentBest.Clone();
                    stagnantGenerations = 0;
                }
                else
                {
                    stagnantGenerations++;
                }

                if (currentBest.Conflicts == 0 && currentBest.Fitness > 95)
                {
                    break;
                }

                if (stagnantGenerations > 30)
                {
                    population = ReinitializeWithElites(population);
                    stagnantGenerations = 0;
                }

                var nextGeneration = new List<TimetableChromosome>();
                
                var elites = population.OrderByDescending(c => c.Fitness).Take(EliteCount).Select(c => c.Clone()).ToList();
                nextGeneration.AddRange(elites);

                while (nextGeneration.Count < PopulationSize)
                {
                    var p1 = TournamentSelect(population);
                    var p2 = TournamentSelect(population);
                    
                    TimetableChromosome c1, c2;
                    if (_random.NextDouble() < CrossoverRate)
                    {
                        (c1, c2) = SubjectBasedCrossover(p1, p2);
                    }
                    else
                    {
                        c1 = p1.Clone();
                        c2 = p2.Clone();
                    }
                    
                    Mutate(c1);
                    if (nextGeneration.Count + 1 < PopulationSize)
                    {
                        Mutate(c2);
                        nextGeneration.Add(c2);
                    }
                    nextGeneration.Add(c1);
                }
                
                population = nextGeneration;
            }

            EvaluatePopulation(population);
            return population.OrderByDescending(c => c.Fitness).First();
        }

        private List<TimetableChromosome> InitializePopulation()
        {
            var pop = new List<TimetableChromosome>();
            
            for (int i = 0; i < PopulationSize; i++)
            {
                var chromo = new TimetableChromosome();
                
                foreach (var subject in _subjects)
                {
                    int required = subject.ClassesPerWeek;
                    int attempts = 0;
                    int scheduled = 0;
                    
                    while (scheduled < required && attempts < 100)
                    {
                        var entry = CreateRandomEntry(subject, chromo.Genes);
                        if (entry != null)
                        {
                            chromo.Genes.Add(entry);
                            scheduled++;
                        }
                        attempts++;
                    }
                }
                
                pop.Add(chromo);
            }
            
            return pop;
        }

        private TimetableEntry? CreateRandomEntry(Subject subject, List<TimetableEntry> currentGenes)
        {
            for (int attempt = 0; attempt < 50; attempt++)
            {
                string day = _days[_random.Next(_days.Length)];
                int period = _availablePeriods[_random.Next(_availablePeriods.Count)];

                if (currentGenes.Any(g => g.DayOfWeek == day && g.PeriodNumber == period))
                    continue;

                var teacher = SelectTeacher(subject, currentGenes, day, period);
                if (teacher == null) continue;

                var classroom = SelectClassroom(subject, currentGenes, day, period);
                if (classroom == null) continue;

                return new TimetableEntry
                {
                    SubjectId = subject.Id,
                    TeacherId = teacher.Id,
                    ClassroomId = classroom.Id,
                    TimeSlotId = _shift.Id,
                    PeriodNumber = period,
                    DayOfWeek = day
                };
            }
            
            return null;
        }

        private User? SelectTeacher(Subject subject, List<TimetableEntry> currentGenes, string day, int period)
        {
            if (subject.TeacherId.HasValue)
            {
                var assignedTeacher = _teachers.FirstOrDefault(u => u.Id == subject.TeacherId.Value);
                if (assignedTeacher != null)
                {
                    if (!IsTeacherBusy(assignedTeacher.Id, day, period, currentGenes))
                    {
                        return assignedTeacher;
                    }
                }
            }

            var deptTeachers = _teachers.Where(t => t.DepartmentId == subject.DepartmentId).ToList();
            
            var availableTeachers = deptTeachers.Where(t => !IsTeacherBusy(t.Id, day, period, currentGenes)).ToList();
            
            if (availableTeachers.Any())
            {
                return availableTeachers[_random.Next(availableTeachers.Count)];
            }

            return null;
        }

        private Classroom? SelectClassroom(Subject subject, List<TimetableEntry> currentGenes, string day, int period)
        {
            var availableClassrooms = _classrooms
                .Where(c => !IsClassroomBusy(c.Id, day, period, currentGenes))
                .ToList();

            if (availableClassrooms.Any())
            {
                return availableClassrooms[_random.Next(availableClassrooms.Count)];
            }

            return null;
        }

        private bool IsTeacherBusy(int teacherId, string day, int period, List<TimetableEntry> currentGenes)
        {
            if (currentGenes.Any(g => g.TeacherId == teacherId && g.DayOfWeek == day && g.PeriodNumber == period))
                return true;

            if (_existingEntries.Any(e => e.TeacherId == teacherId && e.DayOfWeek == day && 
                e.PeriodNumber == period && e.TimeSlotId == _shift.Id))
                return true;

            return false;
        }

        private bool IsClassroomBusy(int classroomId, string day, int period, List<TimetableEntry> currentGenes)
        {
            if (currentGenes.Any(g => g.ClassroomId == classroomId && g.DayOfWeek == day && g.PeriodNumber == period))
                return true;

            if (_existingEntries.Any(e => e.ClassroomId == classroomId && e.DayOfWeek == day && 
                e.PeriodNumber == period && e.TimeSlotId == _shift.Id))
                return true;

            return false;
        }

        private void EvaluatePopulation(List<TimetableChromosome> population)
        {
            foreach (var chromo in population)
            {
                int conflicts = 0;
                double fitness = 100.0;

                var duplicateSlots = chromo.Genes
                    .GroupBy(g => new { g.DayOfWeek, g.PeriodNumber })
                    .Where(g => g.Count() > 1)
                    .Sum(g => g.Count() - 1);
                conflicts += duplicateSlots;

                var teacherConflicts = chromo.Genes
                    .GroupBy(g => new { g.TeacherId, g.DayOfWeek, g.PeriodNumber })
                    .Where(g => g.Count() > 1)
                    .Sum(g => g.Count() - 1);
                conflicts += teacherConflicts;

                var classroomConflicts = chromo.Genes
                    .GroupBy(g => new { g.ClassroomId, g.DayOfWeek, g.PeriodNumber })
                    .Where(g => g.Count() > 1)
                    .Sum(g => g.Count() - 1);
                conflicts += classroomConflicts;

                var globalTeacherConflicts = chromo.Genes.Count(gene =>
                    _existingEntries.Any(e => e.TeacherId == gene.TeacherId && 
                        e.DayOfWeek == gene.DayOfWeek && 
                        e.PeriodNumber == gene.PeriodNumber && 
                        e.TimeSlotId == _shift.Id));
                conflicts += globalTeacherConflicts;

                var globalClassroomConflicts = chromo.Genes.Count(gene =>
                    _existingEntries.Any(e => e.ClassroomId == gene.ClassroomId && 
                        e.DayOfWeek == gene.DayOfWeek && 
                        e.PeriodNumber == gene.PeriodNumber && 
                        e.TimeSlotId == _shift.Id));
                conflicts += globalClassroomConflicts;

                chromo.Conflicts = conflicts;
                fitness -= (conflicts * 15);

                var multipleSubjectsPerDay = chromo.Genes
                    .GroupBy(g => new { g.DayOfWeek, g.SubjectId })
                    .Where(g => g.Count() > 1)
                    .Sum(g => (g.Count() - 1) * 3);
                fitness -= multipleSubjectsPerDay;

                var teacherWorkload = chromo.Genes
                    .GroupBy(g => new { g.TeacherId, g.DayOfWeek })
                    .Select(g => g.Count());
                
                foreach (var dailyLoad in teacherWorkload)
                {
                    if (dailyLoad > 4) fitness -= (dailyLoad - 4) * 5;
                    if (dailyLoad == 0) fitness += 2;
                }

                var dailyDistribution = chromo.Genes
                    .GroupBy(g => g.DayOfWeek)
                    .Select(g => g.Count())
                    .ToList();
                
                if (dailyDistribution.Any())
                {
                    var avgPerDay = dailyDistribution.Average();
                    var variance = dailyDistribution.Sum(d => Math.Pow(d - avgPerDay, 2)) / dailyDistribution.Count;
                    fitness -= variance * 0.5;
                }

                var subjectCompletion = _subjects.Sum(s =>
                {
                    var scheduled = chromo.Genes.Count(g => g.SubjectId == s.Id);
                    var required = s.ClassesPerWeek;
                    return Math.Abs(scheduled - required);
                });
                fitness -= subjectCompletion * 10;

                // Check for gaps in schedule (penalty for free periods between classes AND morning gaps)
                int dailyGaps = 0;
                foreach (var day in _days)
                {
                    var dayGenes = chromo.Genes
                        .Where(g => g.DayOfWeek == day)
                        .OrderBy(g => g.PeriodNumber)
                        .ToList();

                    if (dayGenes.Count > 0)
                    {
                        // Penalize late starts (Morning Gaps) - ensures schedule starts at Period 1
                        if (dayGenes[0].PeriodNumber > 1)
                        {
                            dailyGaps += (dayGenes[0].PeriodNumber - 1);
                        }

                        // Penalize gaps between classes
                        for (int i = 0; i < dayGenes.Count - 1; i++)
                        {
                            int gap = dayGenes[i + 1].PeriodNumber - dayGenes[i].PeriodNumber - 1;
                            if (gap > 0)
                            {
                                // Heavy penalty for gaps
                                dailyGaps += gap;
                            }
                        }
                    }
                }
                fitness -= dailyGaps * 25; // Massive penalty for gaps to ensure continuity

                chromo.Fitness = Math.Max(0, fitness);
            }
        }

        private TimetableChromosome TournamentSelect(List<TimetableChromosome> pop)
        {
            var tournament = pop.OrderBy(x => _random.Next()).Take(TournamentSize).ToList();
            return tournament.OrderByDescending(c => c.Fitness).First();
        }

        private (TimetableChromosome, TimetableChromosome) SubjectBasedCrossover(TimetableChromosome p1, TimetableChromosome p2)
        {
            var c1 = new TimetableChromosome();
            var c2 = new TimetableChromosome();

            var subjectIds = _subjects.Select(s => s.Id).ToList();
            var splitPoint = _random.Next(1, subjectIds.Count);

            var c1Subjects = subjectIds.Take(splitPoint).ToHashSet();
            var c2Subjects = subjectIds.Skip(splitPoint).ToHashSet();

            foreach (var gene in p1.Genes)
            {
                if (c1Subjects.Contains(gene.SubjectId))
                {
                    c1.Genes.Add(gene.Clone());
                }
                else
                {
                    c2.Genes.Add(gene.Clone());
                }
            }

            foreach (var gene in p2.Genes)
            {
                if (c2Subjects.Contains(gene.SubjectId))
                {
                    c1.Genes.Add(gene.Clone());
                }
                else
                {
                    c2.Genes.Add(gene.Clone());
                }
            }

            return (c1, c2);
        }

        private void Mutate(TimetableChromosome chromo)
        {
            foreach (var gene in chromo.Genes.ToList())
            {
                if (_random.NextDouble() < MutationRate)
                {
                    int mutationType = _random.Next(4);

                    switch (mutationType)
                    {
                        case 0:
                            MutateTimeSlot(gene, chromo.Genes);
                            break;
                        case 1:
                            MutateTeacher(gene, chromo.Genes);
                            break;
                        case 2:
                            MutateClassroom(gene, chromo.Genes);
                            break;
                        case 3:
                            SwapGenes(chromo);
                            break;
                    }
                }
            }
        }

        private void MutateTimeSlot(TimetableEntry gene, List<TimetableEntry> allGenes)
        {
            for (int attempt = 0; attempt < 20; attempt++)
            {
                string newDay = _days[_random.Next(_days.Length)];
                int newPeriod = _availablePeriods[_random.Next(_availablePeriods.Count)];

                if (!allGenes.Any(g => g != gene && g.DayOfWeek == newDay && g.PeriodNumber == newPeriod))
                {
                    if (!IsTeacherBusy(gene.TeacherId, newDay, newPeriod, allGenes.Where(g => g != gene).ToList()) &&
                        !IsClassroomBusy(gene.ClassroomId, newDay, newPeriod, allGenes.Where(g => g != gene).ToList()))
                    {
                        gene.DayOfWeek = newDay;
                        gene.PeriodNumber = newPeriod;
                        break;
                    }
                }
            }
        }

        private void MutateTeacher(TimetableEntry gene, List<TimetableEntry> allGenes)
        {
            var subject = _subjects.FirstOrDefault(s => s.Id == gene.SubjectId);
            if (subject != null)
            {
                var newTeacher = SelectTeacher(subject, allGenes.Where(g => g != gene).ToList(), gene.DayOfWeek, gene.PeriodNumber);
                if (newTeacher != null)
                {
                    gene.TeacherId = newTeacher.Id;
                }
            }
        }

        private void MutateClassroom(TimetableEntry gene, List<TimetableEntry> allGenes)
        {
            var subject = _subjects.FirstOrDefault(s => s.Id == gene.SubjectId);
            if (subject != null)
            {
                var newClassroom = SelectClassroom(subject, allGenes.Where(g => g != gene).ToList(), gene.DayOfWeek, gene.PeriodNumber);
                if (newClassroom != null)
                {
                    gene.ClassroomId = newClassroom.Id;
                }
            }
        }

        private void SwapGenes(TimetableChromosome chromo)
        {
            if (chromo.Genes.Count < 2) return;

            var gene1 = chromo.Genes[_random.Next(chromo.Genes.Count)];
            var gene2 = chromo.Genes[_random.Next(chromo.Genes.Count)];

            if (gene1 != gene2)
            {
                var tempDay = gene1.DayOfWeek;
                var tempPeriod = gene1.PeriodNumber;

                gene1.DayOfWeek = gene2.DayOfWeek;
                gene1.PeriodNumber = gene2.PeriodNumber;

                gene2.DayOfWeek = tempDay;
                gene2.PeriodNumber = tempPeriod;
            }
        }

        private List<TimetableChromosome> ReinitializeWithElites(List<TimetableChromosome> population)
        {
            var elites = population.OrderByDescending(c => c.Fitness).Take(EliteCount).Select(c => c.Clone()).ToList();
            var newPop = InitializePopulation();
            
            for (int i = 0; i < EliteCount && i < newPop.Count; i++)
            {
                newPop[i] = elites[i];
            }
            
            return newPop;
        }
    }

    public static class Extensions
    {
        public static TimetableEntry Clone(this TimetableEntry g)
        {
            return new TimetableEntry
            {
                SubjectId = g.SubjectId,
                TeacherId = g.TeacherId,
                ClassroomId = g.ClassroomId,
                TimeSlotId = g.TimeSlotId,
                PeriodNumber = g.PeriodNumber,
                DayOfWeek = g.DayOfWeek,
                TimetableId = g.TimetableId
            };
        }
    }
}
