import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Clock, Zap, Sun, Moon, Coffee, Timer, Layers } from 'lucide-react';
import { timeSlotService } from '../services';
import { toast } from 'react-toastify';

export default function TimeSlots() {
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        shift: 'Morning',
        startTime: '08:00',
        endTime: '14:00',
        periodDurationMinutes: 60,
        breakDurationMinutes: 15,
        breakAfterPeriod: 3,
        year: 1
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await timeSlotService.getAll();
            setTimeSlots(data.data || []);
        } catch (error) {
            toast.error('Error loading shifts');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const validateShiftTime = (shift, startTime) => {
        const [hours, minutes] = startTime.split(':').map(Number);

        if (shift === 'Morning') {
            // Morning: 04:00 to 11:59
            if (hours < 4 || hours >= 12) {
                return "Morning shift must start between 4:00 AM and 11:59 AM";
            }
        } else if (shift === 'Evening') {
            // Evening: 12:00 to 17:59
            if (hours < 12 || hours >= 18) {
                return "Evening shift must start between 12:00 PM and 5:59 PM";
            }
        } else if (shift === 'Night') {
            // Night: 18:00 to 03:59 (next day)
            if (hours < 18 && hours >= 4) {
                return "Night shift must start between 6:00 PM and 3:59 AM";
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const timeError = validateShiftTime(formData.shift, formData.startTime);
        if (timeError) {
            toast.error(timeError);
            return;
        }

        const start = new Date(`1970-01-01T${formData.startTime}`);
        const end = new Date(`1970-01-01T${formData.endTime}`);

        if (start >= end) {
            toast.error('Start time must be before end time');
            return;
        }

        const diffMinutes = Math.round((end - start) / (1000 * 60));

        if (diffMinutes < 180 || diffMinutes > 600) {
            toast.error('Shift duration must be between 3 and 10 hours');
            return;
        }

        const periodDuration = parseInt(formData.periodDurationMinutes);
        const breakDuration = parseInt(formData.breakDurationMinutes);
        const breakAfter = parseInt(formData.breakAfterPeriod);

        let currentUsed = 0;
        let periodsCount = 0;
        while (currentUsed + periodDuration <= diffMinutes) {
            currentUsed += periodDuration;
            periodsCount++;

            if (periodsCount % breakAfter === 0) {
                if (currentUsed + breakDuration <= diffMinutes) {
                    currentUsed += breakDuration;
                }
            }
        }

        if (currentUsed !== diffMinutes) {
            toast.error('The shift duration does not perfectly match the period and break configuration. Please adjust the timings.');
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
                endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
                periodDurationMinutes: parseInt(formData.periodDurationMinutes),
                breakDurationMinutes: parseInt(formData.breakDurationMinutes),
                breakAfterPeriod: parseInt(formData.breakAfterPeriod),
                year: parseInt(formData.year)
            };

            if (editingId) {
                await timeSlotService.update(editingId, { ...dataToSubmit, id: editingId });
                toast.success('Shift updated successfully');
            } else {
                await timeSlotService.create(dataToSubmit);
                toast.success('Shift created successfully');
            }

            setShowModal(false);
            setEditingId(null);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving shift');
        }
    };

    const handleEdit = (slot) => {
        setFormData({
            shift: slot.shift,
            startTime: slot.startTime.substring(0, 5),
            endTime: slot.endTime.substring(0, 5),
            periodDurationMinutes: slot.periodDurationMinutes || 60,
            breakDurationMinutes: slot.breakDurationMinutes || 15,
            breakAfterPeriod: slot.breakAfterPeriod || 3,
            year: slot.year || 1
        });
        setEditingId(slot.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this shift?')) {
            try {
                await timeSlotService.delete(id);
                toast.success('Shift deleted successfully');
                loadData();
            } catch (error) {
                toast.error('Error deleting shift');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div></div>;
    }

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Institutional Shifts</h1>
                    <p className="text-gray-500 font-medium mt-1">Configure flexible time slots, breaks, and durations</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingId(null); setFormData({ shift: 'Morning', startTime: '08:00', endTime: '14:00', periodDurationMinutes: 60, breakDurationMinutes: 15, breakAfterPeriod: 3, year: 1 }); }}
                    className="bg-linear-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
                >
                    <Plus className="w-6 h-6" />
                    <span>Add Shift</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {timeSlots.map((slot) => (
                    <div key={slot.id} className="bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 p-8 hover:border-indigo-500 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-16 -mt-16 group-hover:bg-indigo-600 transition-all duration-500 opacity-20 group-hover:opacity-10"></div>

                        <div className="flex justify-between items-start mb-8 relative">
                            <div className={`p-5 rounded-3xl ${slot.shift === 'Morning' ? 'bg-orange-100 text-orange-600' : slot.shift === 'Evening' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-50'}`}>
                                {slot.shift === 'Morning' ? <Sun className="w-8 h-8" /> : slot.shift === 'Evening' ? <Zap className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(slot)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-2xl transition-all">
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(slot.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-2xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{slot.shift} Shift</h3>
                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        Year {slot.year || 1}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-6 space-y-3">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>Timing</span>
                                    </div>
                                    <span className="text-gray-900">{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Timer className="w-4 h-4 text-gray-400" />
                                        <span>Period Duration</span>
                                    </div>
                                    <span className="text-gray-900">{slot.periodDurationMinutes || 60} min</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Coffee className="w-4 h-4 text-gray-400" />
                                        <span>Break ({slot.breakDurationMinutes || 15}m)</span>
                                    </div>
                                    <span className="text-gray-900">After {slot.breakAfterPeriod || 3} periods</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-fade-in relative border border-white/20">
                        <div className="mb-6">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit' : 'Configure'} Shift</h2>
                            <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest mt-1">Setup Timetable Parameters</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shift Name</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        value={formData.shift}
                                        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                        required
                                    >
                                        <option value="Morning">Morning</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Night">Night</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Period Time</label>
                                    <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl px-4 py-3">
                                        <input
                                            type="number"
                                            value={formData.periodDurationMinutes}
                                            onChange={(e) => setFormData({ ...formData, periodDurationMinutes: e.target.value })}
                                            className="w-full bg-transparent border-none font-bold text-gray-900 outline-none p-0"
                                            min="30" max="120"
                                            required
                                        />
                                        <span className="text-xs font-bold text-gray-400">min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Starts At</label>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ends At</label>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Break Duration</label>
                                    <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl px-4 py-3">
                                        <input
                                            type="number"
                                            value={formData.breakDurationMinutes}
                                            onChange={(e) => setFormData({ ...formData, breakDurationMinutes: e.target.value })}
                                            className="w-full bg-transparent border-none font-bold text-gray-900 outline-none p-0"
                                            min="5" max="60"
                                            required
                                        />
                                        <span className="text-xs font-bold text-gray-400">min</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Break After Period</label>
                                    <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl px-4 py-3">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={formData.breakAfterPeriod}
                                            onChange={(e) => setFormData({ ...formData, breakAfterPeriod: e.target.value })}
                                            className="w-full bg-transparent border-none font-bold text-gray-900 outline-none p-0"
                                            min="1" max="10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Year</label>
                                    <select
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        required
                                    >
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                        <option value="5">Year 5</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-1 transition-all duration-300">
                                    Save Configuration
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 bg-gray-50 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all duration-300">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
