import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, departmentService } from '../services';
import { locationService } from '../services/locationService';
import { toast } from 'react-toastify';
import { School, User, GraduationCap, Building2, UserPlus } from 'lucide-react';

export default function Registration() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [registrationType, setRegistrationType] = useState('college');
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verificationOtp, setVerificationOtp] = useState('');
    const [verifyingEmail, setVerifyingEmail] = useState('');

    const [states, setStates] = useState([]);

    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [collegeForm, setCollegeForm] = useState({
        collegeName: '',
        collegeCode: '',
        address: '',
        state: '',
        district: '',
        city: '',
        pincode: '',
        contactEmail: '',
        contactPhone: '',
        establishedYear: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    });

    const [staffForm, setStaffForm] = useState({
        fullName: '',
        email: '',
        password: '',
        collegeId: '',
        roleId: 3,
        departmentId: '',
        designation: '',
    });

    useEffect(() => {
        setEmailVerified(false);
        setOtpSent(false);
        setVerificationOtp('');
        setVerifyingEmail('');

        if (registrationType === 'college') {
            loadStates();
        } else {
            loadColleges();
        }
    }, [registrationType]);

    const loadStates = async () => {
        const data = await locationService.getStates();
        setStates(data);
    };

    const loadColleges = async () => {
        try {
            const response = await authService.getColleges();
            setColleges(response.data || []);
        } catch (error) {
            console.error('Failed to load colleges', error);
        }
    };

    const loadDepartments = async (collegeId) => {
        try {
            const response = await departmentService.getByCollege(collegeId);
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Failed to load departments', error);
            setDepartments([]);
        }
    };

    const handleLocationChange = async (e) => {
        const { name, value } = e.target;
        setCollegeForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCollegeFormChange = (e) => {
        const { name, value } = e.target;
        setCollegeForm({ ...collegeForm, [name]: value });
        if (name === 'adminEmail') setEmailVerified(false);
    };

    const handleStaffFormChange = (e) => {
        const { name, value } = e.target;
        setStaffForm({ ...staffForm, [name]: value });
        if (name === 'email') setEmailVerified(false);

        if (name === 'collegeId' && value) {
            loadDepartments(value);
        }
    };

    const handleSendOtp = async (email) => {
        if (!email || !email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        setOtpLoading(true);
        try {
            await authService.sendRegistrationOtp(email);
            setOtpSent(true);
            setVerifyingEmail(email);
            toast.success('OTP sent to your email!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!verificationOtp || verificationOtp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        setOtpLoading(true);
        try {
            await authService.verifyRegistrationOtp(verifyingEmail, verificationOtp);
            setEmailVerified(true);
            setOtpSent(false);
            setVerificationOtp('');
            toast.success('Email verified successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailVerified) {
            toast.error('Please verify your email address first');
            return;
        }
        setLoading(true);

        try {
            if (registrationType === 'college') {
                const response = await authService.registerCollege(collegeForm);
                toast.success(response.message || 'Registration submitted for approval!');
                navigate('/login');
            } else {
                const dataToSubmit = {
                    ...staffForm,
                    collegeId: parseInt(staffForm.collegeId),
                    roleId: parseInt(staffForm.roleId),
                    departmentId: staffForm.departmentId ? parseInt(staffForm.departmentId) : null,
                };
                const response = await authService.registerPublicUser(dataToSubmit);
                toast.success(response.message || 'Registration submitted for approval!');
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-700 via-indigo-700 to-blue-600">
            <div className="max-w-4xl w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 my-8">
                    <div className="text-center mb-10">
                        <div className="inline-block p-5 bg-linear-to-br from-purple-600 to-blue-600 rounded-3xl mb-4 shadow-xl">
                            <School className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">EduVerse</h1>
                        <p className="text-gray-500 font-medium">Join or Register your institution</p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-2">
                            <button
                                onClick={() => setRegistrationType('college')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${registrationType === 'college'
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Building2 className="w-5 h-5" />
                                Register New College
                            </button>
                            <button
                                onClick={() => setRegistrationType('staff')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${registrationType === 'staff'
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <UserPlus className="w-5 h-5" />
                                Join as Staff
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                        {registrationType === 'college' ? (
                            <>
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <Building2 className="w-6 h-6 text-purple-600" />
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">College Information</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">College Name *</label>
                                            <input
                                                type="text"
                                                name="collegeName"
                                                value={collegeForm.collegeName}
                                                onChange={handleCollegeFormChange}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                                placeholder="ABC College of Engineering"
                                                pattern="^[A-Za-z0-9\s.,&\-]{3,100}$"
                                                title="3-100 characters, alphanumeric and basic punctuation (.,&-) only"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">College Code *</label>
                                            <input
                                                type="text"
                                                name="collegeCode"
                                                value={collegeForm.collegeCode}
                                                onChange={handleCollegeFormChange}
                                                required
                                                maxLength={20}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold"
                                                placeholder="ABC001"
                                                pattern="^[A-Z0-9]{2,20}$"
                                                title="2-20 uppercase alphanumeric characters"
                                                style={{ textTransform: 'uppercase' }}
                                                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Address *</label>
                                            <textarea
                                                name="address"
                                                value={collegeForm.address}
                                                onChange={handleCollegeFormChange}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all min-h-[100px] font-medium"
                                                placeholder="Full detailed address"
                                                required
                                                minLength={10}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">State *</label>
                                            <select
                                                name="state"
                                                value={collegeForm.state}
                                                onChange={handleLocationChange}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer"
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {states.map((state) => (
                                                    <option key={state.id} value={state.name}>{state.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Contact Email *</label>
                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={collegeForm.contactEmail}
                                                onChange={handleCollegeFormChange}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                placeholder="contact@abc.edu"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Contact Phone *</label>
                                            <input
                                                type="tel"
                                                name="contactPhone"
                                                value={collegeForm.contactPhone}
                                                onChange={handleCollegeFormChange}
                                                pattern="\d{10}"
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                placeholder="1234567890"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Established Year *</label>
                                            <input
                                                type="number"
                                                name="establishedYear"
                                                value={collegeForm.establishedYear}
                                                onChange={handleCollegeFormChange}
                                                min="1800"
                                                max={new Date().getFullYear()}
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                placeholder="2000"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <User className="w-6 h-6 text-blue-600" />
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Admin Account</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Admin Name *</label>
                                            <input
                                                type="text"
                                                name="adminName"
                                                value={collegeForm.adminName}
                                                onChange={handleCollegeFormChange}
                                                required
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                                placeholder="John Doe"
                                                pattern="^[A-Za-z\s.]{2,100}$"
                                                title="2-100 characters, letters and spaces only"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Admin Email *</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    name="adminEmail"
                                                    value={collegeForm.adminEmail}
                                                    onChange={handleCollegeFormChange}
                                                    required
                                                    disabled={emailVerified}
                                                    className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                    placeholder="admin@abc.edu"
                                                />
                                                {!emailVerified && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendOtp(collegeForm.adminEmail)}
                                                        disabled={otpLoading || !collegeForm.adminEmail}
                                                        className="px-6 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {otpLoading ? '...' : (otpSent ? 'Resend' : 'Get OTP')}
                                                    </button>
                                                )}
                                                {emailVerified && (
                                                    <div className="flex items-center px-4 bg-green-50 text-green-600 rounded-2xl border-2 border-green-100 font-bold text-sm">
                                                        Verified
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {otpSent && !emailVerified && verifyingEmail === collegeForm.adminEmail && (
                                            <div className="md:col-span-2 space-y-2 animate-fade-in">
                                                <label className="text-xs font-black uppercase tracking-widest ml-1 text-purple-600">Enter Admin Email OTP</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={verificationOtp}
                                                        onChange={(e) => setVerificationOtp(e.target.value)}
                                                        maxLength={6}
                                                        className="flex-1 px-5 py-4 bg-purple-50 border-2 border-purple-200 focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all text-center tracking-[0.5em] font-black"
                                                        placeholder="000000"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleVerifyOtp}
                                                        disabled={otpLoading || verificationOtp.length !== 6}
                                                        className="px-8 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {otpLoading ? '...' : 'Verify'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Admin Password *</label>
                                            <input
                                                type="password"
                                                name="adminPassword"
                                                value={collegeForm.adminPassword}
                                                onChange={handleCollegeFormChange}
                                                required
                                                minLength={8}
                                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                                title="Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                placeholder="********"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <School className="w-6 h-6 text-purple-600" />
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Select Institution</h2>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">College *</label>
                                        <select
                                            name="collegeId"
                                            value={staffForm.collegeId}
                                            onChange={handleStaffFormChange}
                                            required
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer"
                                        >
                                            <option value="">Select Your College</option>
                                            {colleges.map((college) => (
                                                <option key={college.id} value={college.id}>{college.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {staffForm.collegeId && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-6 mt-8">
                                            <User className="w-6 h-6 text-blue-600" />
                                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">Personal Details</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={staffForm.fullName}
                                                    onChange={handleStaffFormChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                                    placeholder="John Doe"
                                                    pattern="^[A-Za-z\s.]{2,100}$"
                                                    title="2-100 characters, letters and spaces only"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email *</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={staffForm.email}
                                                        onChange={handleStaffFormChange}
                                                        required
                                                        disabled={emailVerified}
                                                        className="flex-1 px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                        placeholder="john@college.edu"
                                                    />
                                                    {!emailVerified && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSendOtp(staffForm.email)}
                                                            disabled={otpLoading || !staffForm.email}
                                                            className="px-6 bg-purple-600 text-white rounded-2xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {otpLoading ? '...' : (otpSent ? 'Resend' : 'Get OTP')}
                                                        </button>
                                                    )}
                                                    {emailVerified && (
                                                        <div className="flex items-center px-4 bg-green-50 text-green-600 rounded-2xl border-2 border-green-100 font-bold text-sm">
                                                            Verified
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {otpSent && !emailVerified && verifyingEmail === staffForm.email && (
                                                <div className="md:col-span-2 space-y-2 animate-fade-in">
                                                    <label className="text-xs font-black uppercase tracking-widest ml-1 text-purple-600">Enter OTP sent to your email</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={verificationOtp}
                                                            onChange={(e) => setVerificationOtp(e.target.value)}
                                                            maxLength={6}
                                                            className="flex-1 px-5 py-4 bg-purple-50 border-2 border-purple-200 focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all text-center tracking-[0.5em] font-black"
                                                            placeholder="000000"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyOtp}
                                                            disabled={otpLoading || verificationOtp.length !== 6}
                                                            className="px-8 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                        >
                                                            {otpLoading ? '...' : 'Verify'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Password *</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={staffForm.password}
                                                    onChange={handleStaffFormChange}
                                                    required
                                                    minLength={8}
                                                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all"
                                                    placeholder="********"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Role *</label>
                                                <select
                                                    name="roleId"
                                                    value={staffForm.roleId}
                                                    onChange={handleStaffFormChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer"
                                                >
                                                    <option value={2}>HOD (Head of Department)</option>
                                                    <option value={3}>Teacher (Faculty)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Department *</label>
                                                <select
                                                    name="departmentId"
                                                    value={staffForm.departmentId}
                                                    onChange={handleStaffFormChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-bold cursor-pointer"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map((dept) => (
                                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Designation *</label>
                                                <input
                                                    type="text"
                                                    name="designation"
                                                    value={staffForm.designation}
                                                    onChange={handleStaffFormChange}
                                                    required
                                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-2xl outline-none text-gray-900 transition-all font-medium"
                                                    pattern="^[A-Za-z\s.,-]{2,50}$"
                                                    title="2-50 characters, letters and basic punctuation (.,-) only"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !emailVerified}
                            className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white px-8 py-5 rounded-3xl font-black shadow-2xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.01] transform transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                        >
                            {loading ? 'Registering...' : (
                                <>
                                    <GraduationCap className="w-6 h-6" />
                                    <span>{registrationType === 'college' ? 'Register Institution' : 'Submit Registration'}</span>
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold underline decoration-2 underline-offset-4">
                                Already registered? Sign in here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

