import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'HOD';
            case 3: return 'Teacher';
            default: return 'User';
        }
    };

    return (
        <nav className="bg-linear-to-r from-purple-700 to-blue-600 shadow-xl m-4 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">EduVerse</h1>
                        <p className="text-xs text-white/70 font-medium uppercase tracking-wider">{user?.collegeName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right border-r border-white/20 pr-6">
                        <p className="text-sm font-bold text-white">{user?.fullName}</p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                                {getRoleName(user?.roleId)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

