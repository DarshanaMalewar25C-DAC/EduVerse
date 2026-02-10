import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen, BookCheck, GraduationCap, Building2 } from 'lucide-react';
import { subjectService, departmentService, teacherService } from '../services';
import { toast } from 'react-toastify';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        departmentId: '',
        credits: 3,
        classesPerWeek: 5,
        year: 1,
        durationMinutes: 60,
        teacherId: ''
    });
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [subjectsData, deptsData, teachersData] = await Promise.all([
                subjectService.getAll(),
                departmentService.getAll(),
                teacherService.getAll()
            ]);
            setSubjects(subjectsData.data || []);
            setDepartments(deptsData.data || []);
            setTeachers(teachersData.data || []);
        } catch (error) {
            toast.error('Error loading subjects/departments');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const teacherAssignedCount = subjects.filter(s => s.teacherId === parseInt(formData.teacherId) && s.id !== editingId).length;
            if (teacherAssignedCount > 0 && formData.teacherId) {
                toast.error('This teacher is already assigned to another subject. Generation requires unique teachers for each subject.');
                return;
            }

            const dataToSubmit = {
                ...formData,
                departmentId: parseInt(formData.departmentId) || 0,
                credits: parseInt(formData.credits) || 0,
                classesPerWeek: parseInt(formData.classesPerWeek) || 5,
                year: parseInt(formData.year) || 1,
                durationMinutes: parseInt(formData.durationMinutes) || 60,
                teacherId: formData.teacherId ? parseInt(formData.teacherId) : null
            };

            if (editingId) {
                const updatedSub = await subjectService.update(editingId, { ...dataToSubmit, id: editingId });
                toast.success('Subject updated successfully');

                setSubjects(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
            } else {
                const newSub = await subjectService.create(dataToSubmit);
                toast.success('Subject created successfully');
                setSubjects(prev => [...prev, newSub]);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({
                name: '',
                code: '',
                departmentId: departments[0]?.id?.toString() || '',
                credits: 3,
                classesPerWeek: 5,
                year: 1,
                durationMinutes: 60,
                teacherId: ''
            });
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving subject');
        }
    };

    const handleEdit = (sub) => {
        setFormData({
            name: sub.name,
            code: sub.code,
            departmentId: sub.departmentId.toString(),
            departmentName: sub.departmentName,
            credits: sub.credits,
            classesPerWeek: sub.classesPerWeek || 5,
            year: sub.year || 1,
            durationMinutes: sub.durationMinutes,
            teacherId: sub.teacherId?.toString() || '',
            teacherName: sub.teacherName,
        });
        setEditingId(sub.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                await subjectService.delete(id);
                toast.success('Subject deleted successfully');
                loadData();
            } catch (error) {
                toast.error('Error deleting subject');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Subjects</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage academic curriculum and course details</p>
                </div>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setEditingId(null);
                        setFormData({
                            name: '',
                            code: '',
                            departmentId: departments[0]?.id?.toString() || '',
                            credits: 3,
                            classesPerWeek: 5,
                            year: 1,
                            durationMinutes: 60,
                            teacherId: ''
                        });
                    }}
                    className="bg-linear-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
                >
                    <Plus className="w-6 h-6" />
                    <span>Add Subject</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjects.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:border-green-500 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-linear-to-br from-green-50 to-white rounded-2xl border border-green-100 transition-colors">
                                <BookOpen className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(sub)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(sub.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-1">{sub.name}</h3>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-green-600 font-bold uppercase tracking-widest">{sub.code}</p>
                            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Year {sub.year || 1}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                            <Building2 className="w-3 h-3" />
                            <span>{sub.departmentName || 'Loading...'}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-6 text-indigo-600 font-black uppercase text-[10px] tracking-widest">
                            <GraduationCap className="w-3 h-3" />
                            <span>Prof. {sub.teacherName || 'Not Assigned'}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="p-1.5 bg-gray-50 rounded-lg"><BookCheck className="w-4 h-4" /></span>
                            <span>{sub.credits} Credits</span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">{editingId ? 'Edit' : 'Add'} Subject</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Subject Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Data Structures" required />
                                </div>
                                <div>
                                    <label className="label">Code</label>
                                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="input-field" placeholder="CS201" required pattern="[A-Z0-9\-]+" title="Uppercase alphanumeric code (hyphens allowed)" />
                                </div>
                                <div>
                                    <label className="label">Department</label>
                                    <select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} className="input-field" required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Assigned Professor</label>
                                    <select value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })} className="input-field">
                                        <option value="">Select Professor</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Credits</label>
                                    <input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} className="input-field" min="1" max="10" required />
                                </div>
                                <div>
                                    <label className="label">Weekly Classes</label>
                                    <input type="number" value={formData.classesPerWeek} onChange={(e) => setFormData({ ...formData, classesPerWeek: e.target.value })} className="input-field" min="1" max="10" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div>
                                    <label className="label">Duration (Min)</label>
                                    <input type="number" value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })} className="input-field" min="30" max="180" step="15" required readOnly />
                                </div>
                                <div>
                                    <label className="label">Academic Year</label>
                                    <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="input-field" required>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                        <option value="5">Year 5</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-linear-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">Save</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all duration-200">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

