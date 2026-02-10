import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services';
import { toast } from 'react-toastify';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            toast.success(response.message || 'Password reset instructions sent to your email');
            if (response.message.includes('token:')) {
                const token = response.message.split('token: ')[1];
                navigate('/reset-password', { state: { token } });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reset email');
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
                            <KeyRound className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot Password</h1>
                        <p className="text-gray-500 font-medium">Enter your email to reset your password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 px-1 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all placeholder:text-gray-400"
                                    placeholder="your.email@college.edu"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-purple-200 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <KeyRound className="w-6 h-6" />
                                    <span>Send Reset Link</span>
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

