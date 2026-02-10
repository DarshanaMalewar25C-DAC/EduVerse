import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { toast } from 'react-toastify';
import { UserCheck, CheckCircle, XCircle, Clock, Mail, Shield } from 'lucide-react';

export default function PendingApprovals() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            const response = await authService.getPendingUsers();
            setPendingUsers(response.data || []);
        } catch (error) {
            console.error('Failed to load pending users:', error);
            toast.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id, approve) => {
        try {
            const response = await authService.approveUser(id, approve);
            toast.success(response.message || (approve ? 'User approved' : 'User rejected'));
            loadPendingUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process approval');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Pending User Approvals</h1>
                <p className="text-gray-600 mt-2 text-lg">
                    Review and approve HOD and Teacher registrations for <span className="text-purple-600 font-bold">{user?.collegeName}</span>
                </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <UserCheck className="w-7 h-7 text-purple-600" />
                    <h2 className="text-2xl font-black text-gray-900">Pending Registrations</h2>
                    <span className="ml-auto bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-black text-sm">
                        {pendingUsers.length} Pending
                    </span>
                </div>

                {pendingUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No pending user registrations</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingUsers.map((pendingUser) => (
                            <div
                                key={pendingUser.id}
                                className="border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-300 transition-all duration-200 bg-gray-50"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900">{pendingUser.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase">
                                                        {pendingUser.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700 font-medium">{pendingUser.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-700 font-medium">
                                                    Registered: {new Date(pendingUser.createdAt).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApproval(pendingUser.id, true)}
                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproval(pendingUser.id, false)}
                                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

