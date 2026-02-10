import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, CheckCircle, Search, Clock, XCircle, Trash2, Plus } from 'lucide-react';
import { timetableService, semesterService, departmentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Timetables() {
    const [timetables, setTimetables] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [showGridModal, setShowGridModal] = useState(false);
    const [selectedTimetable, setSelectedTimetable] = useState(null);
    const { user } = useAuth();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        if (user?.roleId !== 1 && user?.departmentId) {
            setSelectedDepartment(user.departmentId.toString());
        }
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const promises = [
                timetableService.getAll(),
                semesterService.getAll()
            ];

            if (user?.roleId === 1) {
                promises.push(departmentService.getAll());
            }

            const [ttData, semsData, deptsData] = await Promise.all(promises);

            setTimetables((ttData.data || []).sort((a, b) => b.id - a.id));
            setSemesters(semsData.data || []);

            if (deptsData) {
                setDepartments(deptsData.data || []);
            }
        } catch (error) {
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSemester || !selectedDepartment || !selectedYear) {
            return toast.warning('Please select Semester, Department and Year');
        }

        setGenerating(true);
        try {
            await timetableService.generate({
                semesterId: parseInt(selectedSemester),
                departmentId: parseInt(selectedDepartment),
                year: parseInt(selectedYear),
                numberOfSolutions: 3
            });
            toast.success('Timetable generation started');
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error generating timetable');
        } finally {
            setGenerating(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await timetableService.approve({ timetableId: id, approve: true });
            toast.success('Timetable approved');
            loadData();
        } catch (error) {
            toast.error('Error approving timetable');
        }
    };

    const handleReject = async (id) => {
        try {
            await timetableService.approve({ timetableId: id, approve: false });
            toast.success('Timetable rejected');
            loadData();
        } catch (error) {
            toast.error('Error rejecting timetable');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this timetable?')) return;
        try {
            await timetableService.delete(id);
            toast.success('Timetable deleted');
            loadData();
        } catch (error) {
            toast.error('Error deleting timetable');
        }
    };

    const handleViewGrid = async (id) => {
        try {
            setLoading(true);
            const response = await timetableService.getById(id);
            const data = response.data;

            // Extract unique periods and their timings
            const uniquePeriods = [];
            const seenPeriods = new Set();

            data.entries.forEach(e => {
                if (!seenPeriods.has(e.periodNumber)) {
                    seenPeriods.add(e.periodNumber);
                    uniquePeriods.push({
                        number: e.periodNumber,
                        time: e.timeSlot,
                        startTime: e.startTime,
                        endTime: e.endTime
                    });
                }
            });

            uniquePeriods.sort((a, b) => a.number - b.number);

            // Insert Break Row
            const breakAfter = data.breakAfterPeriod || 0;
            const periodsWithBreak = [];

            uniquePeriods.forEach((p, index) => {
                periodsWithBreak.push(p);
                if (p.number === breakAfter && index < uniquePeriods.length - 1) {
                    // Calculate break time
                    const breakStart = p.endTime;
                    const breakEnd = uniquePeriods[index + 1].startTime;
                    periodsWithBreak.push({
                        isBreak: true,
                        time: `${breakStart} - ${breakEnd}`,
                        number: 'BREAK'
                    });
                }
            });

            setPeriods(periodsWithBreak);
            setSelectedTimetable(data);
            setShowGridModal(true);
        } catch (error) {
            toast.error('Error fetching details');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!selectedTimetable) return;

        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(20);
        doc.text(`Timetable: ${selectedTimetable.name}`, 14, 15);
        doc.setFontSize(12);
        doc.text(`Semester: ${selectedTimetable.semesterName}`, 14, 25);

        const tableData = periods.map(p => {
            const row = [`${p.time}`];
            days.forEach(day => {
                const entry = selectedTimetable.entries.find(e =>
                    (e.dayOfWeek === day || e.DayOfWeek === day) && (e.periodNumber === p.number)
                );
                row.push(entry ? `${entry.subjectCode}\n${entry.subjectName}\n${entry.facultyName}` : '-');
            });
            return row;
        });

        autoTable(doc, {
            startY: 35,
            head: [['Time', ...days]],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [102, 51, 153] }
        });

        doc.save(`${selectedTimetable.name.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Timetables</h1>
                    <p className="text-gray-500 font-medium mt-1">AI-Powered Academic Scheduling (Year {selectedYear || 'All'})</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {user?.roleId === 1 && (
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="bg-white px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 outline-none focus:border-purple-500 transition-all shadow-sm"
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    )}
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-white px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 outline-none focus:border-purple-500 transition-all shadow-sm"
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-white px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 outline-none focus:border-purple-500 transition-all shadow-sm"
                    >
                        <option value="">Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                    </select>
                    {user?.roleId === 1 && (
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-xl shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                            <span>{generating ? 'Start Generation' : 'Generate New'}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {timetables
                    .filter(tt => {
                        const semMatch = !selectedSemester || tt.semesterId == selectedSemester || tt.SemesterId == selectedSemester;
                        const yearMatch = !selectedYear || tt.year == selectedYear;
                        const deptMatch = !selectedDepartment || tt.departmentId == selectedDepartment || tt.DepartmentId == selectedDepartment;
                        return semMatch && yearMatch && deptMatch;
                    })
                    .map((tt) => (
                        <div key={tt.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:border-purple-500 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl border ${tt.status === 'Approved' ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100'}`}>
                                    <Calendar className={`w-8 h-8 ${tt.status === 'Approved' ? 'text-green-600' : 'text-purple-600'}`} />
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tt.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {tt.status}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-1">{tt.name}</h3>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-6">{tt.semesterName} (Year {tt.year})</p>

                            <div className="flex gap-4">
                                <button onClick={() => handleViewGrid(tt.id)} className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all flex items-center justify-center space-x-2">
                                    <Search className="w-4 h-4" />
                                    <span>View Grid</span>
                                </button>
                                {user?.roleId === 2 && tt.status !== 'Approved' && tt.status !== 'Rejected' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApprove(tt.id)} className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Approve">
                                            <CheckCircle className="w-6 h-6" />
                                        </button>
                                        <button onClick={() => handleReject(tt.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Reject">
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>
                                )}
                                {user?.roleId === 1 && (
                                    <button onClick={() => handleDelete(tt.id)} className="p-4 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm" title="Delete">
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
            </div>

            {(() => {
                const filtered = timetables.filter(tt => {
                    const semMatch = !selectedSemester || tt.semesterId == selectedSemester || tt.SemesterId == selectedSemester;
                    const yearMatch = !selectedYear || tt.year == selectedYear;
                    const deptMatch = !selectedDepartment || tt.departmentId == selectedDepartment || tt.DepartmentId == selectedDepartment;
                    return semMatch && yearMatch && deptMatch;
                });

                if (filtered.length === 0) {
                    return (
                        <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                            <Calendar className="w-16 h-16 text-gray-300 mb-6" />
                            <h3 className="text-2xl font-black text-gray-400">
                                {timetables.length === 0 ? 'No AI-Generated Schedules' : 'No schedules match these filters'}
                            </h3>
                            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">
                                {timetables.length === 0 ? 'Choose parameters above to begin' : 'Try adjusting the semester or year'}
                            </p>
                        </div>
                    );
                }
                return null;
            })()}

            {showGridModal && selectedTimetable && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-4xl w-full max-w-[95vw] h-[90vh] flex flex-col shadow-2xl animate-scale-up overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-purple-50 to-white">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedTimetable.name}</h2>
                                <p className="text-purple-600 font-bold uppercase text-xs tracking-widest mt-1">Institutional Weekly Schedule</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={downloadPDF}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>Export PDF</span>
                                </button>
                                <button
                                    onClick={() => setShowGridModal(false)}
                                    className="p-3 bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 overflow-auto flex-1 bg-gray-50/50">
                            <table className="w-full border-separate border-spacing-2">
                                <thead>
                                    <tr>
                                        <th className="p-3 sticky left-0 z-10 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/95 backdrop-blur-md border-b border-gray-100 w-32 shadow-sm">Time Slot</th>
                                        {days.map(day => (
                                            <th key={day} className="p-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/95 backdrop-blur-md border-b border-gray-100 min-w-36">{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {periods.map((p, index) => {
                                        if (p.isBreak) {
                                            return (
                                                <tr key="break-row">
                                                    <td className="p-3 sticky left-0 z-10 font-black text-xs whitespace-nowrap border-b border-gray-100 bg-orange-50 text-orange-600 shadow-sm">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase tracking-tighter mb-1">BREAK</span>
                                                            <span className="font-black">{p.time}</span>
                                                        </div>
                                                    </td>
                                                    <td colSpan={days.length} className="bg-orange-50/50 p-2 text-center align-middle border-b border-orange-100">
                                                        <span className="text-orange-400 font-black text-xs tracking-[0.5em] uppercase">Lunch Break</span>
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return (
                                            <tr key={p.number}>
                                                <td className="p-3 sticky left-0 z-10 font-black text-xs whitespace-nowrap border-b border-gray-100 bg-white text-gray-900 shadow-[2px_0_10px_-2px_rgba(0,0,0,0.05)]">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter mb-1">Period {p.number}</span>
                                                        <span className="font-black text-indigo-600">{p.time}</span>
                                                    </div>
                                                </td>
                                                {days.map(day => {
                                                    const entry = selectedTimetable.entries.find(e =>
                                                        (e.dayOfWeek === day || e.DayOfWeek === day) && (e.periodNumber === p.number || e.PeriodNumber === p.number)
                                                    );
                                                    return (
                                                        <td key={day} className={`p-2 rounded-xl border transition-all h-28 align-top ${entry ? 'bg-white border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200' : 'bg-gray-50/30 border-dashed border-gray-100'}`}>
                                                            {entry ? (
                                                                <div className="space-y-2 h-full flex flex-col justify-between">
                                                                    <div>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <div className="text-purple-700 font-black text-[10px] px-2 py-0.5 bg-purple-50 rounded-lg whitespace-nowrap">{entry.subjectCode || entry.SubjectCode}</div>
                                                                        </div>
                                                                        <div className="text-gray-900 font-bold text-[11px] leading-tight line-clamp-2">{entry.subjectName || entry.SubjectName}</div>
                                                                    </div>
                                                                    <div className="pt-2 border-t border-gray-50">
                                                                        <div className="text-blue-600 font-black text-[10px] truncate">{entry.facultyName || entry.FacultyName}</div>
                                                                        <div className="text-gray-400 text-[9px] font-medium truncate mt-0.5">{entry.classroomName || entry.ClassroomName}</div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="h-full flex items-center justify-center">
                                                                    <span className="text-gray-200 font-black text-[9px] tracking-widest">FREE</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
