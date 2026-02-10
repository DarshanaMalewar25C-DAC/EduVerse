import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    departmentService,
    classroomService,
    subjectService,
    teacherService,
    semesterService,
    timeSlotService,
} from '../services';
import {
    Users,
    Home,
    BookOpen,
    Calendar,
    PlusCircle,
    Building2,
    BookCheck
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        departments: 0,
        classrooms: 0,
        subjects: 0,
        teachers: 0,
        semesters: 0,
        timeSlots: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [
                departments,
                classrooms,
                subjects,
                teachers,
                semesters,
                timeSlots,
            ] = await Promise.all([
                departmentService.getAll(),
                classroomService.getAll(),
                subjectService.getAll(),
                teacherService.getAll(),
                semesterService.getAll(),
                timeSlotService.getAll(),
            ]);

            setStats({
                departments: (departments.data || []).length,
                classrooms: (classrooms.data || []).length,
                subjects: (subjects.data || []).length,
                teachers: (teachers.data || []).length,
                semesters: (semesters.data || []).length,
                timeSlots: (timeSlots.data || []).length,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleGreeting = () => {
        switch (user?.roleId) {
            case 1: return 'Administrator Dashboard';
            case 2: return 'Head of Department Dashboard';
            case 3: return 'Teacher Dashboard';
            default: return 'Dashboard';
        }
    };

    const quickActions = [
        {
            name: 'Register User',
            description: 'Add HOD or Teacher',
            icon: <PlusCircle className="w-6 h-6" />,
            link: '/register-user',
            color: 'from-primary-500 to-blue-500',
            roles: [1],
        },
        {
            name: 'Manage Departments',
            description: 'Add or edit departments',
            icon: <Building2 className="w-6 h-6" />,
            link: '/departments',
            color: 'from-secondary-500 to-purple-500',
            roles: [1],
        },
        {
            name: 'Manage Subjects',
            description: 'Add or edit subjects',
            icon: <BookCheck className="w-6 h-6" />,
            link: '/subjects',
            color: 'from-green-500 to-teal-500',
            roles: [1, 2],
        },
        {
            name: 'View Timetables',
            description: 'View and manage timetables',
            icon: <Calendar className="w-6 h-6" />,
            link: '/timetables',
            color: 'from-orange-500 to-red-500',
            roles: [1, 2, 3],
        },
    ];

    const filteredQuickActions = quickActions.filter(action =>
        action.roles.includes(user?.roleId)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{getRoleGreeting()}</h1>
                <p className="text-gray-600 mt-2 text-lg">
                    Welcome back, <span className="text-purple-600 font-bold">{user?.fullName}</span>
                </p>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mt-1">
                    {user?.collegeName} • Code: {user?.collegeCode}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Departments</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.departments}</p>
                        </div>
                        <div className="p-4 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-200">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Classrooms</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.classrooms}</p>
                        </div>
                        <div className="p-4 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Subjects</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.subjects}</p>
                        </div>
                        <div className="p-4 bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-200">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Teachers</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{stats.teachers}</p>
                        </div>
                        <div className="p-4 bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-200">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-red-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredQuickActions.map((action, index) => (
                        <Link
                            key={action.name}
                            to={action.link}
                            className="p-6 rounded-2xl bg-linear-to-br from-red-50 to-white hover:from-white hover:to-white border border-red-100 hover:border-red-500 transition-all duration-300 group shadow-sm hover:shadow-xl"
                        >
                            <div className={`p-4 bg-linear-to-br ${action.color} rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                {action.icon}
                            </div>
                            <h3 className="text-gray-900 font-black mb-1 text-lg">{action.name}</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

