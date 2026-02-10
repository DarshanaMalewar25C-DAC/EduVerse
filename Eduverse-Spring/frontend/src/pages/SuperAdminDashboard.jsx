import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { toast } from 'react-toastify';
import {
    Building2, UserCheck, CheckCircle, XCircle, Clock,
    Mail, MapPin, Navigation, Phone, Calendar, User, LayoutDashboard,
    Search, Filter, ChevronRight, Info, Map as MapIcon
} from 'lucide-react';

export default function SuperAdminDashboard({ tab }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(tab || 'pending');
    const [colleges, setColleges] = useState([]);
    const [stats, setStats] = useState({
        pendingColleges: 0,
        totalColleges: 0
    });

    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pending') {
                const response = await authService.getPendingColleges();
                setColleges(response.data || []);
                setStats(prev => ({ ...prev, pendingColleges: (response.data || []).length }));
            } else {
                const response = await authService.getAllColleges();
                const filteredColleges = (response.data || []).filter(c => c.collegeCode !== 'SUPERADMIN');
                setColleges(filteredColleges);
                setStats(prev => ({ ...prev, totalColleges: filteredColleges.length }));
            }
        } catch (error) {
            console.error('Failed to load colleges:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id, approve) => {
        try {
            const response = await authService.approveCollege(id, approve);
            toast.success(response.message || (approve ? 'College approved' : 'College rejected'));
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process approval');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="bg-linear-to-r from-purple-700 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">
                            {activeTab === 'pending' ? 'College Approvals' : 'All Colleges'}
                        </h1>
                        <p className="text-purple-100 font-medium text-lg mt-2 opacity-90">
                            {activeTab === 'pending'
                                ? 'Review and manage registration requests for new colleges'
                                : 'Monitor all active and approved institutions in the system'}
                        </p>
                    </div>

                </div>
                <Building2 className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
            </div>

            {loading ? (
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-24 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-black text-xl animate-pulse tracking-tight">Syncing with EduVerse Hub...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {colleges.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-dashed border-gray-200 p-20 text-center">
                            <div className="inline-block p-8 bg-gray-50 rounded-full mb-6">
                                <Building2 className="w-16 h-16 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">All caught up!</h3>
                            <p className="text-gray-500 font-bold text-lg mt-2">
                                {activeTab === 'pending'
                                    ? 'No colleges are currently awaiting approval.'
                                    : 'The institution directory is currently empty.'}
                            </p>
                        </div>
                    ) : (
                        colleges.map((college) => (
                            <div
                                key={college.id}
                                className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group"
                            >
                                <div className="p-10">
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className="p-5 bg-purple-600 rounded-3xl text-white shadow-xl">
                                                    <Building2 className="w-10 h-10" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-4">
                                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{college.collegeName}</h2>
                                                        <span className="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase">
                                                            {college.collegeCode}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                                                        <Navigation className="w-5 h-5 text-purple-500" />
                                                        <span className="font-bold text-lg">{college.state || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Lead</p>
                                                        <p className="text-gray-800 font-bold text-lg">{college.adminName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                                        <Mail className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Email</p>
                                                        <p className="text-gray-800 font-bold text-lg">{college.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                                                        <Phone className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</p>
                                                        <p className="text-gray-800 font-bold text-lg">{college.contactPhone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                                                        <Calendar className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Established Year</p>
                                                        <p className="text-gray-800 font-bold text-lg">{college.establishedYear || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {college.address && (
                                                <div className="mt-8 pt-8 border-t border-gray-100 flex gap-4">
                                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                                                        <MapIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Address</p>
                                                        <p className="text-gray-800 font-medium text-lg leading-relaxed">{college.address}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {activeTab === 'pending' && (
                                            <div className="lg:w-64 flex flex-col gap-4">
                                                <button
                                                    onClick={() => handleApproval(college.id, true)}
                                                    className="w-full px-8 py-5 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black shadow-xl shadow-green-100 hover:shadow-green-200 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                                                >
                                                    <CheckCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                                    <span>Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(college.id, false)}
                                                    className="w-full px-8 py-5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-3xl font-black border-2 border-red-100 hover:border-red-600 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                                                >
                                                    <XCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                                                    <span>Reject</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 px-10 py-4 flex items-center justify-end border-t border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Entry Record: {new Date(college.createdAt).toLocaleDateString('en-GB')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

