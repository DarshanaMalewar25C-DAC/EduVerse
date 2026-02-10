using EduVerse.API.Models;

namespace EduVerse.API.Algorithms
{
    public class TimetableChromosome
    {
        public List<TimetableEntry> Genes { get; set; } = new List<TimetableEntry>();
        public double Fitness { get; set; }
        public int Conflicts { get; set; }

        public TimetableChromosome Clone()
        {
            return new TimetableChromosome
            {
                Genes = Genes.Select(g => new TimetableEntry
                {
                    SubjectId = g.SubjectId,
                    TeacherId = g.TeacherId,
                    ClassroomId = g.ClassroomId,
                    TimeSlotId = g.TimeSlotId,
                    PeriodNumber = g.PeriodNumber,
                    DayOfWeek = g.DayOfWeek,
                    TimetableId = g.TimetableId
                }).ToList(),
                Fitness = this.Fitness,
                Conflicts = this.Conflicts
            };
        }
    }
}

