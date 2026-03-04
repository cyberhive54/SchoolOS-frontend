// src/types/index.ts — SchoolOS Frontend Type Definitions

export interface User {
    id: string;
    school_id: string;
    email: string;
    first_name: string;
    last_name: string | null;
    role: UserRole;
    avatar_url: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
}

export type UserRole =
    | 'platform_owner'
    | 'super_admin'
    | 'admin'
    | 'principal'
    | 'teacher'
    | 'accountant'
    | 'receptionist'
    | 'librarian'
    | 'parent'
    | 'student';

export interface LoginResponse {
    data: {
        access_token: string;
        refresh_token: string;
        user: User;
    };
}

export interface ApiResponse<T> {
    data: T;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
    };
}

// ── Students ─────────────────────────────────────────────────────────────────

export interface Student {
    id: string;
    school_id: string;
    admission_number: string;
    first_name: string;
    last_name: string | null;
    date_of_birth: string;
    gender: string | null;
    blood_group: string | null;
    status: 'active' | 'inactive' | 'transferred' | 'withdrawn' | 'alumni';
    admission_date: string;
    category_id: string | null;
    current_address: Record<string, unknown>;
    emergency_contact: Record<string, unknown>;
    created_at: string;
}

export interface StudentParentLink {
    id: string;
    student_id: string;
    parent_id: string;
    relation: string;
    is_primary: boolean;
    is_pickup_authorized: boolean;
}

// ── Front Office ──────────────────────────────────────────────────────────────

export type EnquiryStatus = 'new' | 'contacted' | 'visited' | 'follow_up' | 'converted' | 'lost';

export interface AdmissionEnquiry {
    id: string;
    school_id: string;
    enquiry_number: string;
    student_name: string;
    father_name: string | null;
    mother_name: string | null;
    contact_phone: string;
    contact_email: string | null;
    class_sought: string | null;
    source: string | null;
    status: EnquiryStatus;
    follow_up_date: string | null;
    notes: string | null;
    created_at: string;
}

export interface VisitorLog {
    id: string;
    visitor_name: string;
    purpose: string;
    meeting_with: string | null;
    check_in_time: string;
    check_out_time: string | null;
    id_type: string | null;
    status: string;
    created_at: string;
}

// ── Fees ─────────────────────────────────────────────────────────────────────

export interface FeeInvoice {
    id: string;
    school_id: string;
    invoice_number: string;
    student_id: string;
    invoice_date: string;
    due_date: string | null;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
    status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
    created_at: string;
}

export interface FeeTransaction {
    id: string;
    transaction_number: string;
    invoice_id: string;
    amount: number;
    payment_method: string;
    status: string;
    payment_date: string;
    created_at: string;
}

// ── Academics ─────────────────────────────────────────────────────────────────

export interface AcademicYear {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    is_active: boolean;
}

export interface Class {
    id: string;
    name: string;
    numeric_value: number | null;
    board: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface Section {
    id: string;
    class_id: string;
    name: string;
    class_teacher_id: string | null;
    capacity: number | null;
    is_active: boolean;
}

export interface Subject {
    id: string;
    name: string;
    code: string | null;
    subject_type: string | null;
    is_elective: boolean;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceSession {
    id: string;
    class_id: string;
    section_id: string;
    date: string;
    session_type: string;
    is_finalized: boolean;
    marked_by: string | null;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'excused';

export interface StudentAttendance {
    id: string;
    student_id: string;
    session_id: string;
    date: string;
    status: AttendanceStatus;
    remarks: string | null;
}

export interface AttendanceSummary {
    student_id: string;
    year: number;
    month: number;
    total_working_days: number;
    total_present: number;
    total_absent: number;
    attendance_percentage: number;
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
    total_students: number;
    today_attendance_pct: number;
    pending_fees_count: number;
    open_enquiries: number;
    recent_admissions: number;
    total_staff: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: number;
    children?: NavItem[];
    roles?: UserRole[];
}
