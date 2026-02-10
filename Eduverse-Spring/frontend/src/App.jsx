import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Home from './pages/Home';
import CollegeRegistration from './pages/CollegeRegistration';
import Dashboard from './pages/Dashboard';
import UserRegistration from './pages/UserRegistration';
import Departments from './pages/Departments';
import Classrooms from './pages/Classrooms';
import Subjects from './pages/Subjects';
import Semesters from './pages/Semesters';
import TimeSlots from './pages/TimeSlots';
import Timetables from './pages/Timetables';
import Users from './pages/Users';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PendingApprovals from './pages/PendingApprovals';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<CollegeRegistration />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="superadmin-dashboard" element={<ProtectedRoute allowedRoles={[4]}><SuperAdminDashboard tab="pending" /></ProtectedRoute>} />
                        <Route path="superadmin-colleges" element={<ProtectedRoute allowedRoles={[4]}><SuperAdminDashboard tab="all" /></ProtectedRoute>} />
                        <Route path="register-user" element={<ProtectedRoute allowedRoles={[1, 4]}><UserRegistration /></ProtectedRoute>} />
                        <Route path="pending-approvals" element={<ProtectedRoute allowedRoles={[1]}><PendingApprovals /></ProtectedRoute>} />
                        <Route path="departments" element={<ProtectedRoute allowedRoles={[1]}><Departments /></ProtectedRoute>} />
                        <Route path="classrooms" element={<ProtectedRoute allowedRoles={[1, 2]}><Classrooms /></ProtectedRoute>} />
                        <Route path="subjects" element={<ProtectedRoute allowedRoles={[1, 2]}><Subjects /></ProtectedRoute>} />
                        <Route path="semesters" element={<ProtectedRoute allowedRoles={[1, 2]}><Semesters /></ProtectedRoute>} />
                        <Route path="timeslots" element={<ProtectedRoute allowedRoles={[1, 2]}><TimeSlots /></ProtectedRoute>} />
                        <Route path="users" element={<ProtectedRoute allowedRoles={[1]}><Users /></ProtectedRoute>} />
                        <Route path="timetables" element={<Timetables />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>

            <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="colored" />
        </AuthProvider>
    );
}

export default App;

