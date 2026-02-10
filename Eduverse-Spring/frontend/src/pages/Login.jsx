import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { BookOpen, LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [otp, setOtp] = useState('');
    const [loginEmail, setLoginEmail] = useState('');

    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
        }
    }, [location.state]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login(formData.email, formData.password);

            if (response.data?.requires2FA) {
                setLoginEmail(formData.email);
                setShow2FA(true);
                toast.info('Please enter the OTP sent to your email');
            } else if (response.data) {
                login(response.data.token, response.data);
                toast.success('Successfully logged in!');

                if (response.data.roleId === 4) {
                    navigate('/superadmin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.verify2FA(loginEmail, otp);
            if (response.data) {
                login(response.data.token, response.data);
                toast.success('Successfully logged in!');

                if (response.data.roleId === 4) {
                    navigate('/superadmin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-purple-700 via-indigo-700 to-blue-600 relative">
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white font-bold transition-all group"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="underline decoration-2 underline-offset-4">Back to Home</span>
            </Link>
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
                            <BookOpen className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">EduVerse</h1>
                        <p className="text-gray-500 font-medium">Sign in to your college account</p>
                    </div>

                    {show2FA ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 italic font-medium text-blue-700">
                                Enter the code sent to your email
                            </div>
                            <form onSubmit={handle2FASubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">
                                        OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={6}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all text-center text-3xl font-black tracking-widest placeholder:text-gray-300"
                                        placeholder="000000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShow2FA(false)}
                                    className="w-full text-gray-500 font-bold hover:text-purple-600 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                                    placeholder="your.email@college.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : (
                                    <>
                                        <LogIn className="w-6 h-6" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700 font-bold underline decoration-2 underline-offset-4 transition-all">
                            Forgot Password?
                        </Link>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-purple-600 hover:text-purple-700 underline decoration-2 underline-offset-4 transition-all font-bold">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

