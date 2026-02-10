import api from './api';

export const authService = {
    registerCollege: async (data) => {
        const response = await api.post('/auth/register-college', data);
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    registerUser: async (data) => {
        const response = await api.post('/auth/register-user', data);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    registerPublicUser: async (data) => {
        const response = await api.post('/auth/register-public-user', data);
        return response.data;
    },

    getColleges: async () => {
        const response = await api.get('/auth/colleges');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    getPendingColleges: async () => {
        const response = await api.get('/auth/pending-colleges');
        return response.data;
    },

    getAllColleges: async () => {
        const response = await api.get('/auth/all-colleges');
        return response.data;
    },

    getPendingUsers: async () => {
        const response = await api.get('/auth/pending-users');
        return response.data;
    },

    approveCollege: async (id, approve, reason = null) => {
        const response = await api.post('/auth/approve-college', { id, approve, reason });
        return response.data;
    },

    approveUser: async (id, approve, reason = null) => {
        const response = await api.post('/auth/approve-user', { id, approve, reason });
        return response.data;
    },

    verifyEmail: async (email, otp) => {
        const response = await api.post('/auth/verify-email', { email, otp });
        return response.data;
    },

    sendRegistrationOtp: async (email) => {
        const response = await api.post('/auth/send-registration-otp', { email });
        return response.data;
    },

    verifyRegistrationOtp: async (email, otp) => {
        const response = await api.post('/auth/verify-registration-otp', { email, otp });
        return response.data;
    },

    verify2FA: async (email, otp) => {
        const response = await api.post('/auth/verify-2fa', { email, otp });
        return response.data;
    },
};

export const departmentService = {
    getAll: async () => {
        const response = await api.get('/departments');
        return response.data;
    },

    getByCollege: async (collegeId) => {
        const response = await api.get(`/departments/public/${collegeId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/departments/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/departments', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/departments/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    },
};

export const classroomService = {
    getAll: async () => {
        const response = await api.get('/classrooms');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/classrooms/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/classrooms', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/classrooms/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/classrooms/${id}`);
        return response.data;
    },
};

export const subjectService = {
    getAll: async () => {
        const response = await api.get('/subjects');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/subjects/${id}`);
        return response.data;
    },

    getByDepartment: async (departmentId) => {
        const response = await api.get(`/subjects/department/${departmentId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/subjects', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/subjects/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/subjects/${id}`);
        return response.data;
    },
};

export const teacherService = {
    getAll: async () => {
        const response = await api.get('/teachers');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/teachers/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/teachers/${id}`, data);
        return response.data;
    },
};

export const batchService = {
    getAll: async () => {
        const response = await api.get('/batches');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/batches/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/batches', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/batches/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/batches/${id}`);
        return response.data;
    },
};

export const semesterService = {
    getAll: async () => {
        const response = await api.get('/semesters');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/semesters/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/semesters', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/semesters/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/semesters/${id}`);
        return response.data;
    },
};

export const timeSlotService = {
    getAll: async () => {
        const response = await api.get('/timeslots');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/timeslots/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/timeslots', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/timeslots/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/timeslots/${id}`);
        return response.data;
    },
};

export const userService = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

export const timetableService = {
    getAll: async () => {
        const response = await api.get('/timetable');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/timetable/${id}`);
        return response.data;
    },

    generate: async (data) => {
        const response = await api.post('/timetable/generate', data);
        return response.data;
    },

    approve: async (data) => {
        const response = await api.post('/timetable/approve', data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/timetable/${id}`);
        return response.data;
    },
};

