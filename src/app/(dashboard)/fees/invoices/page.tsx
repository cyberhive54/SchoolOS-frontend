'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Search, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { feesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import type { FeeInvoice } from '@/types';
import { format, parseISO } from 'date-fns';

const STATUS_CONFIG = {
    pending: { label: 'Pending', cls: 'badge-warning', icon: <Clock size={10} /> },
    partial: { label: 'Partial', cls: 'badge-info', icon: <AlertTriangle size={10} /> },
    paid: { label: 'Paid', cls: 'badge-success', icon: <CheckCircle size={10} /> },
    overdue: { label: 'Overdue', cls: 'badge-danger', icon: <AlertTriangle size={10} /> },
    cancelled: { label: 'Cancelled', cls: 'badge-default', icon: null },
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export default function InvoicesPage() {
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['invoices', { status, page }],
        queryFn: () => feesApi.listInvoices({ status: status || undefined, page, per_page: 20 }),
        retry: false,
    });

    const invoices: FeeInvoice[] = data?.data?.data ?? [];
    const meta = data?.data?.meta;

    return (
        <>
            <Header title="Fee Invoices" subtitle="Manage student fee collection and payments" />

            <div style={{ padding: '28px' }}>
                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Invoices', value: meta?.total ?? '—', color: 'var(--color-brand)' },
                        { label: 'Pending', value: '—', color: 'var(--color-warning)' },
                        { label: 'Overdue', value: '—', color: 'var(--color-danger)' },
                        { label: 'Collected', value: '₹—', color: 'var(--color-success)' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ '--accent': s.color } as React.CSSProperties}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <button key={k} onClick={() => setStatus(status === k ? '' : k)}
                            style={{
                                padding: '6px 14px', borderRadius: '99px', cursor: 'pointer',
                                fontSize: '0.8125rem', fontWeight: 600,
                                border: `1.5px solid ${status === k ? 'var(--color-brand)' : 'var(--color-border)'}`,
                                background: status === k ? 'rgba(13,148,136,0.1)' : 'var(--color-bg-surface)',
                                color: status === k ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                                transition: 'all 0.15s',
                            }}>
                            {v.label}
                        </button>
                    ))}
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
                        <Plus size={14} />Generate Invoice
                    </button>
                </div>

                {/* Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Student</th>
                                    <th>Invoice Date</th>
                                    <th>Due Date</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                    <th style={{ textAlign: 'right' }}>Paid</th>
                                    <th style={{ textAlign: 'right' }}>Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array.from({ length: 7 }).map((_, i) => (
                                        <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                                            <td key={j}><div className="skeleton" style={{ height: '13px', borderRadius: '4px' }} /></td>
                                        ))}</tr>
                                    ))
                                ) : invoices.length === 0 ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                                        <DollarSign size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                                        No invoices found
                                    </td></tr>
                                ) : (
                                    invoices.map(inv => {
                                        const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
                                        const isOverdue = inv.status === 'overdue';
                                        return (
                                            <tr key={inv.id} className="animate-fadeIn">
                                                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-brand-light)', fontWeight: 600 }}>{inv.invoice_number}</span></td>
                                                <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{inv.student_id.slice(0, 8)}…</td>
                                                <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{format(parseISO(inv.invoice_date), 'dd MMM yyyy')}</td>
                                                <td style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: isOverdue ? 600 : 400 }}>
                                                    {inv.due_date ? format(parseISO(inv.due_date), 'dd MMM yyyy') : '—'}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(inv.total_amount)}</td>
                                                <td style={{ textAlign: 'right', color: 'var(--color-success)' }}>{formatCurrency(inv.paid_amount)}</td>
                                                <td style={{ textAlign: 'right', color: inv.balance_due > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                                                    {formatCurrency(inv.balance_due)}
                                                </td>
                                                <td><span className={`badge ${cfg.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{cfg.icon}{cfg.label}</span></td>
                                                <td>
                                                    <button className="btn btn-ghost btn-sm" style={{ padding: '5px' }}>View</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {meta && meta.total_pages > 1 && (
                        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                {meta.total} invoices total
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
