'use client';

import React from 'react';
import { DollarSign, Users, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';

// ── Stat Card Component ────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    progressPercentage: number;
    progressColor: string;
}

function StatCard({ title, value, icon, progressPercentage, progressColor }: StatCardProps) {
    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: 'var(--color-text-primary)' }}>
                        {icon}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {title}
                    </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {value}
                </div>
            </div>
            {/* Progress bar line */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                    width: `${progressPercentage}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius: '2px'
                }} />
            </div>
        </div>
    );
}

// ── Dummy Chart Component ──────────────────────────────────────────────────────
function DummyLineChart({ title, height }: { title: string; height: string }) {
    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: height
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '16px', marginTop: 0 }}>
                {title}
            </h3>
            <div style={{ flex: 1, border: '1px dashed var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Chart Placeholder
            </div>
        </div>
    );
}

export default function DashboardPage() {
    // Dynamic data array for the 6 top stats
    const dashboardStats = [
        { title: 'Fees Awaiting Payment', value: '1/122', icon: <DollarSign size={18} />, progress: 1, color: '#0ea5e9' },
        { title: 'Staff Approved Leave', value: '0/1', icon: <Briefcase size={18} />, progress: 0, color: '#f59e0b' },
        { title: 'Student Approved Leave', value: '0/0', icon: <GraduationCap size={18} />, progress: 0, color: '#10b981' },
        { title: 'Converted Leads', value: '0/0', icon: <Users size={18} />, progress: 0, color: '#6366f1' },
        { title: 'Staff Present Today', value: '0/9', icon: <CheckCircle size={18} />, progress: 0, color: '#8b5cf6' },
        { title: 'Student Present Today', value: '0/76', icon: <Users size={18} />, progress: 0, color: '#ec4899' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Top Row: 6 Stat Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px'
            }}>
                {dashboardStats.map((stat, idx) => (
                    <StatCard
                        key={idx}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        progressPercentage={stat.progress}
                        progressColor={stat.color}
                    />
                ))}
            </div>

            {/* 2. Middle Row: Two Panels */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '16px'
            }}>
                <DummyLineChart title="Fees Collection & Expenses For March 2026" height="350px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <DummyLineChart title="Income - March 2026" height="calc(175px - 8px)" />
                    <DummyLineChart title="Expense - March 2026" height="calc(175px - 8px)" />
                </div>
            </div>

            {/* 3. Bottom Row: Large Chart */}
            <DummyLineChart title="Fees Collection & Expenses For Session 2025-26" height="400px" />
        </div>
    );
}
