// src/lib/api.ts — Axios instance with JWT auth interceptors

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const { data } = await axios.post<{ data: { access_token: string } }>(
                    `${API_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                );

                const newToken = data.data.access_token;
                localStorage.setItem('access_token', newToken);
                if (typeof window !== 'undefined') {
                    document.cookie = `access_token=${newToken}; path=/; max-age=900; SameSite=Strict`;
                }

                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (typeof window !== 'undefined') {
                    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

// ── Typed API helpers ─────────────────────────────────────────────────────────

export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
};

export const studentsApi = {
    list: (params?: Record<string, unknown>) => api.get('/students', { params }),
    get: (id: string, include?: string) => api.get(`/students/${id}`, { params: include ? { include } : undefined }),
    create: (data: unknown) => api.post('/students', data),
    update: (id: string, data: unknown) => api.patch(`/students/${id}`, data),
    softDelete: (id: string, reason?: string) => api.delete(`/students/${id}`, { data: { reason } }),
    // Parent links
    addParent: (studentId: string, data: unknown) => api.post(`/students/${studentId}/parents`, data),
    // Documents
    getDocuments: (studentId: string) => api.get(`/students/${studentId}/documents`),
    // Categories (BPL, SC/ST, OBC, etc.)
    listCategories: () => api.get('/students/meta/categories'),
    createCategory: (data: { name: string; description?: string; discount_percentage?: number }) =>
        api.post('/students/meta/categories', data),
};

export const frontOfficeApi = {
    listEnquiries: (params?: Record<string, unknown>) => api.get('/front-office/enquiries', { params }),
    createEnquiry: (data: unknown) => api.post('/front-office/enquiries', data),
    updateEnquiry: (id: string, data: unknown) => api.patch(`/front-office/enquiries/${id}`, data),
    listVisitors: (params?: Record<string, unknown>) => api.get('/front-office/visitors', { params }),
    checkInVisitor: (data: unknown) => api.post('/front-office/visitors', data),
    checkOutVisitor: (id: string) => api.patch(`/front-office/visitors/${id}/checkout`),
};

export const feesApi = {
    listInvoices: (params?: Record<string, unknown>) => api.get('/fees/invoices', { params }),
    getInvoice: (id: string) => api.get(`/fees/invoices/${id}`),
    generateInvoice: (data: unknown) => api.post('/fees/invoices', data),
    recordPayment: (data: unknown) => api.post('/fees/payments/cash', data),
    listFeeTypes: () => api.get('/fees/types'),
};

export const academicsApi = {
    listYears: () => api.get('/academics/years'),
    getCurrentYear: () => api.get('/academics/years/current'),
    listClasses: () => api.get('/academics/classes'),
    listSections: (classId?: string) => api.get('/academics/sections', { params: { class_id: classId } }),
    listSubjects: () => api.get('/academics/subjects'),
    getTimetable: (sectionId: string, yearId: string) =>
        api.get('/academics/timetable', { params: { section_id: sectionId, academic_year_id: yearId } }),
};

export const attendanceApi = {
    createSession: (data: unknown) => api.post('/attendance/sessions', data),
    markBulk: (sessionId: string, records: unknown[]) =>
        api.post(`/attendance/sessions/${sessionId}/bulk`, { records }),
    finalizeSession: (sessionId: string) => api.patch(`/attendance/sessions/${sessionId}/finalize`),
    getSectionAttendance: (sectionId: string, date: string) =>
        api.get(`/attendance/sections/${sectionId}`, { params: { date } }),
    getStudentAttendance: (studentId: string, from: string, to: string) =>
        api.get(`/attendance/students/${studentId}`, { params: { from, to } }),
    getStudentSummary: (studentId: string, yearId: string) =>
        api.get(`/attendance/students/${studentId}/summary`, { params: { academic_year_id: yearId } }),
};
