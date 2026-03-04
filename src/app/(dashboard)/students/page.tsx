'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Search, Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { studentsApi } from '@/lib/api';
import type { Student } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { AddStudentModal } from '@/components/students/AddStudentModal';

const STATUS_COLORS: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-default',
    transferred: 'badge-warning',
    withdrawn: 'badge-danger',
    alumni: 'badge-info',
};

const GENDER_MAP: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other', M: 'Male', F: 'Female' };

export default function StudentsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [showAdd, setShowAdd] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['students', { search, status, page }],
        queryFn: () => studentsApi.list({ search: search || undefined, status: status || undefined, page, per_page: 20 }),
        retry: false,
    });

    const students: Student[] = data?.data?.data ?? [];
    const meta = data?.data?.meta;

    return (
        <>
            {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} />}

            <div style={{ padding: '24px' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                        borderRadius: '8px', padding: '9px 14px', flex: '1', minWidth: '220px', maxWidth: '380px',
                        transition: 'border-color 0.15s',
                    }}
                        onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                    >
                        <Search size={15} color="var(--color-text-muted)" />
                        <input
                            type="text" placeholder="Search by name or admission no…"
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.875rem', flex: 1 }}
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                        className="form-input" style={{ width: 'auto', flex: 'none' }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="transferred">Transferred</option>
                        <option value="alumni">Alumni</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                        <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                            <Plus size={14} /> Add Student
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total', value: meta?.total ?? '—', color: 'var(--color-brand)' },
                        { label: 'Active', value: students.filter(s => s.status === 'active').length || '—', color: 'var(--color-success)' },
                        { label: 'This page', value: students.length, color: 'var(--color-info)' },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                            borderRadius: '8px', padding: '10px 18px', display: 'flex', gap: '8px', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{s.value}</span>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Adm. No.</th>
                                    <th>Student Name</th>
                                    <th>DOB / Age</th>
                                    <th>Gender</th>
                                    <th>Status</th>
                                    <th>Admission Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i}>
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <td key={j}><div className="skeleton" style={{ height: '14px', borderRadius: '4px', width: j === 1 ? '120px' : '80px' }} /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                                            <GraduationCap size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                                            No students found
                                            <div style={{ marginTop: '12px' }}>
                                                <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm">
                                                    <Plus size={14} /> Add First Student
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map(s => (
                                        <tr key={s.id} className="animate-fadeIn">
                                            <td>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-brand-light)', fontWeight: 600 }}>
                                                    {s.admission_number}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                                        background: `var(--color-brand)`, opacity: 0.85,
                                                        color: 'white', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700,
                                                    }}>
                                                        {s.first_name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                        {s.first_name} {s.last_name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                                {s.date_of_birth ? format(new Date(s.date_of_birth), 'dd MMM yyyy') : '—'}
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>
                                                {GENDER_MAP[s.gender ?? ''] ?? s.gender ?? '—'}
                                            </td>
                                            <td><span className={`badge ${STATUS_COLORS[s.status] ?? 'badge-default'}`}>{s.status}</span></td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                                {s.admission_date ? format(new Date(s.admission_date), 'dd MMM yyyy') : '—'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                    <Link href={`/students/${s.id}`} className="btn btn-ghost btn-sm" style={{ padding: '5px', textDecoration: 'none' }}>
                                                        <Eye size={14} />
                                                    </Link>
                                                    <Link href={`/students/${s.id}/edit`} className="btn btn-ghost btn-sm" style={{ padding: '5px', textDecoration: 'none' }}>
                                                        <Edit size={14} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta && meta.total_pages > 1 && (
                        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                Showing {(meta.page - 1) * meta.per_page + 1}–{Math.min(meta.page * meta.per_page, meta.total)} of {meta.total}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                <button className="btn btn-secondary btn-sm" disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
