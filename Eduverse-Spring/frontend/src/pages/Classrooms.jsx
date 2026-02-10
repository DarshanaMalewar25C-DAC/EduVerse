import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Home, Monitor, Video, Users } from 'lucide-react';
import { classroomService } from '../services';
import { toast } from 'react-toastify';

export default function Classrooms() {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        building: '',
        capacity: 60,
    });

    useEffect(() => {
        loadClassrooms();
    }, []);

    const loadClassrooms = async () => {
        try {
            const data = await classroomService.getAll();
            setClassrooms(data.data || []);
        } catch (error) {
            toast.error('Error loading classrooms');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                capacity: parseInt(formData.capacity) || 0
            };
            if (editingId) {
                await classroomService.update(editingId, { ...dataToSubmit, id: editingId });
                toast.success('Classroom updated successfully');
            } else {
                await classroomService.create(dataToSubmit);
                toast.success('Classroom created successfully');
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ roomNumber: '', building: '', capacity: 60 });
            loadClassrooms();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving classroom');
        }
    };

    const handleEdit = (room) => {
        setFormData({
            roomNumber: room.roomNumber,
            building: room.building,
            capacity: room.capacity,
        });
        setEditingId(room.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this classroom?')) {
            try {
                await classroomService.delete(id);
                toast.success('Classroom deleted successfully');
                loadClassrooms();
            } catch (error) {
                toast.error('Error deleting classroom');
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Classrooms</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage physical learning spaces and facilities</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingId(null); setFormData({ roomNumber: '', building: '', capacity: 60 }); }}
                    className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
                >
                    <Plus className="w-6 h-6" />
                    <span>Add Classroom</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {classrooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:border-blue-500 transition-all duration-300 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 flex space-x-2">
                            <button onClick={() => handleEdit(room)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(room.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="p-4 bg-linear-to-br from-blue-50 to-white rounded-2xl border border-blue-100 transition-colors">
                                <Home className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{room.roomNumber}</h3>
                                <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">{room.building}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-bold">{room.capacity} seats</span>
                            </div>

                        </div>

                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in relative">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">{editingId ? 'Edit' : 'Add'} Classroom</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Room Number</label>
                                    <input type="text" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} className="input-field" placeholder="L-101" required pattern="[A-Za-z0-9\-]+" title="Alphanumeric room number (e.g. L-101)" />
                                </div>
                                <div>
                                    <label className="label">Building</label>
                                    <input type="text" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} className="input-field" placeholder="Main Block" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Capacity</label>
                                    <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="input-field" required />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200">Save</button>
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all duration-200">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

