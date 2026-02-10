import { useState, useEffect } from 'react';
import { departmentService, subjectService, authService } from '../services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus, User, Mail, Lock, Shield, Building2, Briefcase, Calendar, BookOpen } from 'lucide-react';

export default function UserRegistration() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        roleId: 1,
        departmentId: '',
        subjectIds: [],
        designation: '',
    });

    useEffect(() => {
        loadDepartments();
        loadSubjects();
    }, []);

    useEffect(() => {
        if (formData.departmentId && subjects.length > 0) {
            const filtered = subjects.filter(s => s.departmentId === parseInt(formData.departmentId));
            setFilteredSubjects(filtered);
        } else {
            setFilteredSubjects([]);
        }
    }, [formData.departmentId, subjects]);

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAll();
            setDepartments(data.data || []);
        } catch (err) {
            console.error('Failed to load departments:', err);
        }
    };

    const loadSubjects = async () => {
        try {
            const data = await subjectService.getAll();
            setSubjects(data.data || []);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'roleId') {
            setFormData({
                ...formData,
                [name]: parseInt(value),
                departmentId: '',
                subjectIds: []
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubjectChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }
        setFormData({ ...formData, subjectIds: selected });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                roleId: parseInt(formData.roleId),
                departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
            };
            const response = await authService.registerUser(dataToSubmit);
            toast.success(response.message || 'User registered successfully');

            setFormData({
                fullName: '',
                email: '',
                password: '',
                roleId: 1,
                departmentId: '',
                subjectIds: [],
                designation: '',
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user || (user.roleId !== 1 && user.roleId !== 4)) {
        return (
            <div className="p-8">
                <div className="glass-card p-6 text-center">
                    <p className="text-red-400">Access denied. Only administrators can register users.</p>
                </div>
            </div>
        );
    }

    const getRoleOptions = () => {
        if (user.roleId === 4) {
            return [{ id: 1, name: 'Admin' }];
        } else {
            return [
                { id: 2, name: 'HOD (Head of Department)' },
                { id: 3, name: 'Teacher (Faculty)' }
            ];
        }
    };

    const showDepartmentField = formData.roleId === 2 || formData.roleId === 3;
    const showSubjectField = formData.roleId === 3;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Register New User</h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Add {user.roleId === 4 ? 'Admin' : 'HOD or Teacher'} to <span className="text-purple-600 font-bold">{user.collegeName}</span>
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <User className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Basic Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                        placeholder="John Doe"
                                        pattern="^[A-Za-z\s.]{2,100}$"
                                        title="2-100 characters, letters and spaces only"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                        placeholder="john@college.edu"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={8}
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                        title="Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role *</label>
                                    <select
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer"
                                    >
                                        {getRoleOptions().map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {(showDepartmentField || showSubjectField) && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Academic Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {showDepartmentField && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                                Department *
                                            </label>
                                            <select
                                                name="departmentId"
                                                value={formData.departmentId}
                                                onChange={handleChange}
                                                required={formData.roleId === 2 || formData.roleId === 3}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer"
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name} ({dept.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {showSubjectField && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
                                                Subjects
                                            </label>
                                            <select
                                                multiple
                                                value={formData.subjectIds}
                                                onChange={handleSubjectChange}
                                                disabled={!formData.departmentId}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer disabled:opacity-50 min-h-[120px]"
                                            >
                                                {filteredSubjects.map((subject) => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name} ({subject.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Designation *</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                            placeholder="Professor, Assistant Professor, etc."
                                            pattern="^[A-Za-z\s.,-]{2,50}$"
                                            title="2-50 characters, letters and basic punctuation (.,-) only"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white px-8 py-5 rounded-3xl font-black shadow-2xl shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : (
                                    <>
                                        <UserPlus className="w-7 h-7" />
                                        <span className="text-lg">Register Account</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

