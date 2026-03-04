'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Search, Plus, CheckCircle, Phone, User, Loader2 } from 'lucide-react';
import { frontOfficeApi } from '@/lib/api';

import toast from 'react-hot-toast';
import type { AdmissionEnquiry, EnquiryStatus } from '@/types';
import { format, parseISO } from 'date-fns';

const STATUS_CONFIG: Record<EnquiryStatus, { label: string; cls: string }> = {
    new: { label: 'New', cls: 'badge-info' },
    contacted: { label: 'Contacted', cls: 'badge-warning' },
    visited: { label: 'Visited', cls: 'badge-warning' },
    follow_up: { label: 'Follow Up', cls: 'badge-warning' },
    converted: { label: 'Converted', cls: 'badge-success' },
    lost: { label: 'Lost', cls: 'badge-danger' },
};

export default function EnquiriesPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['enquiries', { search, status }],
        queryFn: () => frontOfficeApi.listEnquiries({ search: search || undefined, status: status || undefined }),
        retry: false,
    });

    const enquiries: AdmissionEnquiry[] = data?.data?.data ?? [];

    return (
        <>


            <div style={{ padding: '28px' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                        borderRadius: '8px', padding: '9px 14px', flex: '1', minWidth: '200px', maxWidth: '360px',
                    }}>
                        <Search size={15} color="var(--color-text-muted)" />
                        <input type="text" placeholder="Search name or phone…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.875rem', flex: 1 }}
                        />
                    </div>

                    <select value={status} onChange={e => setStatus(e.target.value)} className="form-input" style={{ width: 'auto', flex: 'none' }}>
                        <option value="">All Status</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>

                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>
                        <Plus size={14} />New Enquiry
                    </button>
                </div>

                {/* Kanban-style status summary */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => {
                        const count = enquiries.filter(e => e.status === k).length;
                        return (
                            <button key={k}
                                onClick={() => setStatus(status === k ? '' : k)}
                                style={{
                                    padding: '6px 14px', borderRadius: '99px', cursor: 'pointer',
                                    fontSize: '0.8125rem', fontWeight: 600,
                                    border: `1.5px solid ${status === k ? 'var(--color-brand)' : 'var(--color-border)'}`,
                                    background: status === k ? 'rgba(13,148,136,0.1)' : 'var(--color-bg-surface)',
                                    color: status === k ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                                    transition: 'all 0.15s',
                                }}>
                                {v.label} <span style={{ marginLeft: '4px', opacity: 0.8 }}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Enq. No.</th>
                                    <th>Student Name</th>
                                    <th>Contact</th>
                                    <th>Class Sought</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Follow-up</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j}><div className="skeleton" style={{ height: '13px', borderRadius: '4px' }} /></td>
                                        ))}</tr>
                                    ))
                                ) : enquiries.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                                        <ClipboardList size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                                        No enquiries found
                                    </td></tr>
                                ) : (
                                    enquiries.map(eq => (
                                        <tr key={eq.id} className="animate-fadeIn">
                                            <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-brand-light)', fontWeight: 600 }}>{eq.enquiry_number}</span></td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{eq.student_name}</div>
                                                {eq.father_name && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>F: {eq.father_name}</div>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                                    <Phone size={12} />{eq.contact_phone}
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{eq.class_sought ?? '—'}</td>
                                            <td><span className="badge badge-default">{eq.source ?? 'walk-in'}</span></td>
                                            <td><span className={`badge ${STATUS_CONFIG[eq.status]?.cls ?? 'badge-default'}`}>{STATUS_CONFIG[eq.status]?.label}</span></td>
                                            <td style={{ color: eq.follow_up_date ? 'var(--color-warning)' : 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                                {eq.follow_up_date ? format(parseISO(eq.follow_up_date), 'dd MMM') : '—'}
                                            </td>
                                            <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                                                {format(parseISO(eq.created_at), 'dd MMM')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
