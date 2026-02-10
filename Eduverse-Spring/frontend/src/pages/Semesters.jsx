import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { semesterService } from '../services';
import { toast } from 'react-toastify';

export default function Semesters() {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadSemesters();
    }, []);

    const loadSemesters = async () => {
        try {
            const data = await semesterService.getAll();
            setSemesters(data.data || []);
        } catch (error) {
            toast.error('Error loading semesters');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (start >= end) {
            toast.error('Start date must be earlier than end date');
            return;
        }
        try {
            if (editingId) {
                await semesterService.update(editingId, { ...formData, id: editingId });
                toast.success('Semester updated successfully');
            } else {
                await semesterService.create(formData);
                toast.success('Semester created successfully');
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', code: '', startDate: '', endDate: '' });
            loadSemesters();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving semester');
        }
    };

    const handleEdit = (sem) => {
        setFormData({
            name: sem.name,
            code: sem.code,
            startDate: sem.startDate.split('T')[0],
            endDate: sem.endDate.split('T')[0]
        });
        setEditingId(sem.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this semester?')) {
            try {
                await semesterService.delete(id);
                toast.success('Semester deleted successfully');
                loadSemesters();
            } catch (error) {
                toast.error('Error deleting semester');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Semesters</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage academic terms and schedules</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', code: '', startDate: '', endDate: '' }); }}
                    className="bg-linear-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-orange-100 hover:shadow-orange-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
                >
                    <Plus className="w-6 h-6" />
                    <span>Add Semester</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {semesters.map((sem) => (
                    <div key={sem.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:border-orange-500 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-linear-to-br from-orange-50 to-white rounded-2xl border border-orange-100 transition-colors">
                                <Calendar className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(sem)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(sem.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-1">{sem.name}</h3>
                        <p className="text-sm text-orange-600 font-bold uppercase tracking-widest mb-6">{sem.code}</p>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-500 font-medium">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Start: {new Date(sem.startDate).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-500 font-medium">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">End: {new Date(sem.endDate).toLocaleDateString('en-GB')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">{editingId ? 'Edit' : 'Add'} Semester</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label">Semester Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Fall 2024" required />
                            </div>
                            <div>
                                <label className="label">Code</label>
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="input-field" placeholder="FALL24" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input-field" required />
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input-field" required />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-linear-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">Save</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all duration-200">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
