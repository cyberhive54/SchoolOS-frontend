'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { attendanceApi, academicsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import toast from 'react-hot-toast';
import type { AttendanceStatus } from '@/types';
import { format, addDays, subDays } from 'date-fns';

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    present: { label: 'P', color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: <CheckCircle size={14} /> },
    absent: { label: 'A', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: <XCircle size={14} /> },
    late: { label: 'L', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: <Clock size={14} /> },
    half_day: { label: 'H', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', icon: <AlertCircle size={14} /> },
    excused: { label: 'E', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)', icon: <AlertCircle size={14} /> },
};

// Mock student list for demo (replace with API call)
const MOCK_STUDENTS = [
    { id: 'stu-1', name: 'Aarav Sharma', admission_number: '2025/0001' },
    { id: 'stu-2', name: 'Priya Patel', admission_number: '2025/0002' },
    { id: 'stu-3', name: 'Rohit Kumar', admission_number: '2025/0003' },
    { id: 'stu-4', name: 'Sneha Gupta', admission_number: '2025/0004' },
    { id: 'stu-5', name: 'Arjun Singh', admission_number: '2025/0005' },
    { id: 'stu-6', name: 'Kavita Nair', admission_number: '2025/0006' },
];

export default function AttendancePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [saving, setSaving] = useState(false);
    const qc = useQueryClient();

    const { data: sections } = useQuery({
        queryKey: ['sections'],
        queryFn: () => academicsApi.listSections(),
        retry: false,
    });

    const sectionList = sections?.data?.data ?? [];

    const markAll = (status: AttendanceStatus) => {
        const all: Record<string, AttendanceStatus> = {};
        MOCK_STUDENTS.forEach(s => { all[s.id] = status; });
        setAttendance(all);
    };

    const toggleStatus = (studentId: string) => {
        const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'half_day', 'excused'];
        const current = attendance[studentId] ?? 'present';
        const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
        setAttendance(prev => ({ ...prev, [studentId]: statuses[nextIdx] }));
    };

    const handleSave = async () => {
        if (!selectedSectionId) { toast.error('Please select a section first'); return; }
        setSaving(true);
        try {
            // Create session first
            const sessionRes = await attendanceApi.createSession({
                class_id: 'class-placeholder',
                section_id: selectedSectionId,
                academic_year_id: 'year-placeholder',
                date: selectedDate,
                session_type: 'morning',
            });
            const sessionId = sessionRes.data.data.id;

            // Bulk mark
            const records = MOCK_STUDENTS.map(s => ({
                student_id: s.id,
                status: attendance[s.id] ?? 'present',
            }));
            await attendanceApi.markBulk(sessionId, records);
            toast.success('Attendance saved successfully!');
        } catch (err) {
            toast.error('Failed to save attendance. Ensure backend is running.');
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        present: Object.values(attendance).filter(v => v === 'present').length,
        absent: Object.values(attendance).filter(v => v === 'absent').length,
        late: Object.values(attendance).filter(v => v === 'late').length,
    };
    const total = MOCK_STUDENTS.length;
    const markedCount = Object.keys(attendance).length;

    return (
        <>
            <Header title="Attendance" subtitle="Mark and track student attendance" />

            <div style={{ padding: '28px' }}>
                {/* Controls */}
                <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        {/* Date picker */}
                        <div>
                            <label className="form-label">Date</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }}
                                    onClick={() => setSelectedDate(subDays(new Date(selectedDate), 1).toISOString().split('T')[0])}>
                                    <ChevronLeft size={16} />
                                </button>
                                <input type="date" className="form-input" value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    style={{ width: '160px' }} />
                                <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }}
                                    onClick={() => setSelectedDate(addDays(new Date(selectedDate), 1).toISOString().split('T')[0])}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Section picker */}
                        <div style={{ flex: 1, minWidth: '180px' }}>
                            <label className="form-label">Section</label>
                            <select className="form-input" value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)}>
                                <option value="">— Select section —</option>
                                {sectionList.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                                <option value="demo">Demo — Class 10-A</option>
                            </select>
                        </div>

                        {/* Quick mark all */}
                        <div>
                            <label className="form-label">Mark All</label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, any][]).map(([k, v]) => (
                                    <button key={k} onClick={() => markAll(k)}
                                        className="btn btn-sm"
                                        style={{ background: v.bg, color: v.color, border: `1px solid ${v.color}40`, padding: '6px 12px', fontSize: '0.8125rem', fontWeight: 700 }}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary row */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--color-success-bg)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px 18px' }}>
                        <span style={{ color: '#10B981', fontWeight: 700, fontSize: '1.25rem' }}>{stats.present}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginLeft: '6px' }}>Present</span>
                    </div>
                    <div style={{ background: 'var(--color-danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 18px' }}>
                        <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '1.25rem' }}>{stats.absent}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginLeft: '6px' }}>Absent</span>
                    </div>
                    <div style={{ background: 'var(--color-warning-bg)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '10px 18px' }}>
                        <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '1.25rem' }}>{stats.late}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginLeft: '6px' }}>Late</span>
                    </div>
                    <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 18px', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Marked:</span>
                        <span style={{ fontWeight: 700, color: markedCount === total ? 'var(--color-success)' : 'var(--color-text-primary)' }}>{markedCount}/{total}</span>
                    </div>
                </div>

                {/* Attendance grid */}
                <div className="card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '48px' }}>#</th>
                                <th>Student Name</th>
                                <th>Adm. No.</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'center' }}>Click to cycle →</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_STUDENTS.map((student, idx) => {
                                const status = attendance[student.id] ?? 'present';
                                const cfg = STATUS_CONFIG[status];
                                return (
                                    <tr key={student.id} className="animate-fadeIn">
                                        <td style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>{idx + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                                    {student.name[0]}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{student.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{student.admission_number}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                                                {cfg.icon}&nbsp;{status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, any][]).map(([k, v]) => (
                                                    <button key={k} onClick={() => setAttendance(prev => ({ ...prev, [student.id]: k }))}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer',
                                                            border: `2px solid ${status === k ? v.color : 'transparent'}`,
                                                            background: status === k ? v.bg : 'var(--color-bg-elevated)',
                                                            color: v.color, fontWeight: 700, fontSize: '0.75rem',
                                                            transition: 'all 0.1s',
                                                        }}>
                                                        {v.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Save button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn btn-secondary">Save as Draft</button>
                    <button className="btn btn-primary" style={{ minWidth: '160px', justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving…' : '✓ Save Attendance'}
                    </button>
                </div>
            </div>
        </>
    );
}
