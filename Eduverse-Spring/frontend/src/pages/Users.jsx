import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, UserPlus, Mail, Shield, Building, Trash2, Edit3, Check, X, Search, MoreHorizontal } from 'lucide-react';
import { userService, departmentService } from '../services';
import { toast } from 'react-toastify';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        roleId: 3,
        departmentId: '',
        designation: '',
        maxClassesPerDay: 6,
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, deptsData] = await Promise.all([
                userService.getAll(),
                departmentService.getAll()
            ]);

            const currentId = currentUser?.id || currentUser?.userId || currentUser?.Id;
            const currentEmail = currentUser?.email;

            const otherUsers = (usersData.data || []).filter(u => {
                if (!currentId && !currentEmail) return u.roleName !== 'Admin' && u.roleId != 1;
                return u.id != currentId && u.email !== currentEmail && u.roleName !== 'Admin' && u.roleId != 1;
            });

            setUsers(otherUsers);
            setDepartments(deptsData.data || []);
        } catch (error) {
            toast.error('Error loading users/departments');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            roleId: user.roleId,
            departmentId: user.departmentId || '',
            designation: user.designation || '',
            isActive: user.isActive
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.update(editingUser.id, formData);
                toast.success('User updated successfully');
            }
            setIsModalOpen(false);
            setEditingUser(null);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing request');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await userService.delete(id);
            toast.success('User deactivated');
            loadData();
        } catch (error) {
            toast.error('Error deactivating user');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage HODs and Teachers across departments</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-purple-100 overflow-hidden border border-gray-50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                                <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">Role & Dept</th>
                                <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-8 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-purple-50/20 transition-all duration-300">
                                    <td className="p-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-purple-200">
                                                {user.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-lg font-black text-gray-900">{user.fullName}</div>
                                                <div className="text-sm font-bold text-gray-400 flex items-center mt-1">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                <Shield className="w-3 h-3 mr-1.5" />
                                                {user.roleName}
                                            </div>
                                            <div className="text-gray-900 font-bold text-sm block">
                                                {user.departmentName}
                                            </div>
                                            <div className="text-gray-400 font-medium text-xs">
                                                {user.designation || 'Faculty Member'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEdit(user)} className="p-4 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all shadow-sm">
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-4 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            { }
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
                        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-purple-50 to-white">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Edit User Settings</h2>
                                <p className="text-purple-600 font-bold uppercase text-xs tracking-widest mt-1">Profile & Access Control</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                        title="Enter a valid email address"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none appearance-none"
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-purple-100/50 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-6 h-6 rounded-lg text-purple-600 focus:ring-purple-500 border-none bg-white"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm font-black text-purple-900 uppercase tracking-widest">Account Active & Enabled</label>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-1 transition-all duration-300">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

