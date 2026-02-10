import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { departmentService } from '../services';
import { toast } from 'react-toastify';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '' });

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAll();
            setDepartments(data.data || []);
        } catch (error) {
            toast.error('Error loading departments');
            console.error('Error loading departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await departmentService.update(editingId, { ...formData, id: editingId });
            } else {
                await departmentService.create({ ...formData });
            }
            toast.success(`Department ${editingId ? 'updated' : 'created'} successfully`);
            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', code: '' });
            loadDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving department');
            console.error('Error saving department:', error);
        }
    };

    const handleEdit = (dept) => {
        setFormData({ name: dept.name, code: dept.code });
        setEditingId(dept.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await departmentService.delete(id);
                toast.success('Department deleted successfully');
                loadDepartments();
            } catch (error) {
                toast.error('Error deleting department');
                console.error('Error deleting department:', error);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Departments</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage institutional departments and codes</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', code: '' }); }}
                    className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
                >
                    <Plus className="w-6 h-6" />
                    <span>Add Department</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {departments.map((dept) => (
                    <div key={dept.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:border-purple-500 transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-linear-to-br from-purple-50 to-white rounded-2xl border border-purple-100 transition-colors">
                                <Building2 className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(dept)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(dept.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1">{dept.name}</h3>
                        <p className="text-sm text-purple-600 font-bold uppercase tracking-widest mb-4">{dept.code}</p>

                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">{editingId ? 'Edit' : 'Add'} Department</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label">Department Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="Computer Science" required />
                            </div>
                            <div>
                                <label className="label">Code</label>
                                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="input-field" placeholder="CSE" required pattern="[A-Z0-9]+" title="Uppercase alphanumeric code only" />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">Save</button>
                                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all duration-200">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;

