import { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services';
import { toast } from 'react-toastify';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token');

    const [formData, setFormData] = useState({
        token: tokenFromUrl || location.state?.token || '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.resetPassword(formData.token, formData.newPassword);
            toast.success(response.message || 'Password reset successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-700 via-indigo-700 to-blue-600">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-linear-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
                            <Lock className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
                        <p className="text-gray-500 font-medium">Enter your new password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                minLength={8}
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                title="Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
                                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
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
                            {loading ? 'Resetting...' : (
                                <>
                                    <KeyRound className="w-6 h-6" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold inline-flex items-center gap-2 underline decoration-2 underline-offset-4 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

