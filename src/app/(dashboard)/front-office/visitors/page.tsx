'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Plus, ExternalLink } from 'lucide-react';
import { frontOfficeApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { format, parseISO } from 'date-fns';
import type { VisitorLog } from '@/types';

export default function VisitorsPage() {
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['visitors', { search }],
        queryFn: () => frontOfficeApi.listVisitors({ search: search || undefined }),
        retry: false,
    });

    const visitors: VisitorLog[] = data?.data?.data ?? [];

    return (
        <>
            <Header title="Visitor Log" subtitle="Manage campus visitors and pass issuance" />

            <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                        borderRadius: '8px', padding: '9px 14px', flex: '1', minWidth: '200px', maxWidth: '360px',
                    }}>
                        <Search size={15} color="var(--color-text-muted)" />
                        <input type="text" placeholder="Search visitor name or ID…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontSize: '0.875rem', flex: 1 }}
                        />
                    </div>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                        <Plus size={14} />Check In Visitor
                    </button>
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Visitor Name</th>
                                    <th>Purpose</th>
                                    <th>Meeting With</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                                            <td key={j}><div className="skeleton" style={{ height: '13px', borderRadius: '4px' }} /></td>
                                        ))}</tr>
                                    ))
                                ) : visitors.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                                        <Users size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                                        No visitors found today
                                    </td></tr>
                                ) : (
                                    visitors.map(v => (
                                        <tr key={v.id} className="animate-fadeIn">
                                            <td style={{ fontWeight: 600 }}>{v.visitor_name}</td>
                                            <td style={{ color: 'var(--color-text-secondary)' }}>{v.purpose}</td>
                                            <td style={{ color: 'var(--color-brand-light)' }}>{v.meeting_with ?? '—'}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{format(parseISO(v.check_in_time), 'hh:mm a')}</td>
                                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                                {v.check_out_time ? format(parseISO(v.check_out_time), 'hh:mm a') : '—'}
                                            </td>
                                            <td>
                                                <span className={`badge ${v.status === 'checked_in' ? 'badge-success' : 'badge-default'}`}>
                                                    {v.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                {v.status === 'checked_in' && (
                                                    <button className="btn btn-ghost btn-sm" style={{ padding: '5px' }}><ExternalLink size={14} /> Check Out</button>
                                                )}
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
