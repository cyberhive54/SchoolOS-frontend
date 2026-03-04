'use client';

import React from 'react';
import {
    DollarSign, Users, Briefcase, GraduationCap, CheckCircle,
    CalendarCheck, TrendingUp, TrendingDown, ArrowRight,
    BookOpen, MessageSquare, ClipboardList, Bell,
} from 'lucide-react';
import Link from 'next/link';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

// ── Types ──────────────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    accent: string;
    trend?: { value: string; up: boolean };
    href?: string;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon, accent, trend, href }: StatCardProps) {
    const inner = (
        <div className="stat-card card-hover" style={{ '--accent': accent } as React.CSSProperties}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                {/* Icon bubble */}
                <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: accent, flexShrink: 0,
                }}>
                    {icon}
                </div>
                {/* Trend badge */}
                {trend && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        fontSize: '0.75rem', fontWeight: 600,
                        color: trend.up ? 'var(--color-success)' : 'var(--color-warning)',
                        background: trend.up ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                        padding: '3px 8px', borderRadius: '99px',
                    }}>
                        {trend.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {trend.value}
                    </div>
                )}
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {title}
            </div>
            {sub && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {sub}
                </div>
            )}
        </div>
    );

    if (href) {
        return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>;
    }
    return inner;
}

// ── Chart placeholder ──────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, height = '280px', children }: { title: string; subtitle?: string; height?: string; children?: React.ReactNode }) {
    return (
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', height }}>
            <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.78125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{subtitle}</div>}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                {children ?? (
                    <>
                        {/* Decorative placeholder bars */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
                            {[40, 70, 55, 90, 65, 80, 45, 95, 60, 75, 50, 85].map((h, i) => (
                                <div key={i} style={{
                                    width: '14px', height: `${h}%`,
                                    background: i % 3 === 0
                                        ? 'var(--color-brand)'
                                        : i % 3 === 1
                                            ? 'var(--color-accent)'
                                            : 'var(--color-bg-elevated)',
                                    borderRadius: '3px 3px 0 0',
                                    opacity: i % 3 === 2 ? 0.4 : 0.85,
                                    transition: 'height 0.3s ease',
                                }} />
                            ))}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Connect API to see live data
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Quick action button ────────────────────────────────────────────────────────
function QuickAction({ label, icon, href, color }: { label: string; icon: React.ReactNode; href: string; color: string }) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '16px 12px', borderRadius: 'var(--border-radius)',
                background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
            }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = color;
                    el.style.transform = 'translateY(-2px)';
                    el.style.boxShadow = `0 4px 20px ${color}30`;
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--color-border)';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                }}
            >
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color,
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>{label}</span>
            </div>
        </Link>
    );
}

// ── Recent activity item ───────────────────────────────────────────────────────
function ActivityItem({ icon, text, time, color }: { icon: React.ReactNode; text: string; time: string; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
            <div style={{
                width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color,
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{text}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{time}</div>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { theme } = useThemeStore();
    const { user } = useAuthStore();

    const firstName = user?.first_name ?? 'Admin';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats: StatCardProps[] = [
        {
            title: 'Fees Awaiting Payment',
            value: '122', sub: '1 overdue this week',
            icon: <DollarSign size={20} />, accent: '#0EA5E9',
            trend: { value: '+3 today', up: false }, href: '/fees/invoices',
        },
        {
            title: 'Total Students',
            value: '763', sub: '4 new admissions this month',
            icon: <GraduationCap size={20} />, accent: '#10B981',
            trend: { value: '+4', up: true }, href: '/students',
        },
        {
            title: 'Staff Present Today',
            value: '9/12', sub: '3 on approved leave',
            icon: <Briefcase size={20} />, accent: '#F59E0B',
            href: '/attendance',
        },
        {
            title: 'Students Present Today',
            value: '0/76', sub: 'Attendance not marked yet',
            icon: <CheckCircle size={20} />, accent: '#6366F1',
            href: '/attendance',
        },
        {
            title: 'Open Enquiries',
            value: '14', sub: '6 follow-ups due today',
            icon: <ClipboardList size={20} />, accent: '#EC4899',
            trend: { value: '+6', up: false }, href: '/front-office/enquiries',
        },
        {
            title: 'Pending Leave Requests',
            value: '1', sub: '1 staff, 0 students',
            icon: <CalendarCheck size={20} />, accent: '#8B5CF6',
            href: '/attendance',
        },
    ];

    const quickActions = [
        { label: 'New Admission', icon: <GraduationCap size={18} />, href: '/students/new', color: '#10B981' },
        { label: 'Collect Fee', icon: <DollarSign size={18} />, href: '/fees/collect', color: '#0EA5E9' },
        { label: 'Mark Attendance', icon: <CheckCircle size={18} />, href: '/attendance', color: '#6366F1' },
        { label: 'Add Enquiry', icon: <ClipboardList size={18} />, href: '/front-office/enquiries', color: '#EC4899' },
        { label: 'Send Announcement', icon: <Bell size={18} />, href: '/communication', color: '#F59E0B' },
        { label: 'View Timetable', icon: <BookOpen size={18} />, href: '/academics/timetable', color: '#8B5CF6' },
        { label: 'Visitor Log', icon: <Users size={18} />, href: '/front-office/visitors', color: '#14B8A6' },
        { label: 'Send Message', icon: <MessageSquare size={18} />, href: '/communication', color: '#F97316' },
    ];

    const activities = [
        { icon: <DollarSign size={14} />, text: 'Fee payment of ₹15,000 recorded for Rahul Sharma (Class 8A)', time: '5 minutes ago', color: '#10B981' },
        { icon: <Users size={14} />, text: 'New admission enquiry from Priya Patel — Class 4', time: '23 minutes ago', color: '#0EA5E9' },
        { icon: <CheckCircle size={14} />, text: 'Attendance finalized for Class 7B by Mrs. Sharma', time: '1 hour ago', color: '#6366F1' },
        { icon: <Bell size={14} />, text: 'Fee overdue SMS sent to 12 parents', time: '2 hours ago', color: '#F59E0B' },
        { icon: <GraduationCap size={14} />, text: 'Student Arjun Mehta promoted to Class 9', time: '3 hours ago', color: '#8B5CF6' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>

            {/* ── Welcome Banner ────────────────────────────────────────────── */}
            <div style={{
                background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)',
                borderRadius: '12px', padding: '24px 28px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-30px', right: '60px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: '-40px', right: '20px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginBottom: '4px' }}>
                        {theme.schoolName} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                        {greeting}, {firstName} 👋
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
                        Here's what's happening at your school today.
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', flexShrink: 0 }}>
                    <Link href="/students/new" className="btn" style={{
                        background: 'rgba(255,255,255,0.2)', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)',
                        textDecoration: 'none',
                    }}>
                        <GraduationCap size={15} /> New Admission
                    </Link>
                </div>
            </div>

            {/* ── Stat Cards ────────────────────────────────────────────────── */}
            <div className="dash-stats-grid">
                {stats.map((s, i) => (
                    <div key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                        <StatCard {...s} />
                    </div>
                ))}
            </div>

            {/* ── Quick Actions ─────────────────────────────────────────────── */}
            <div className="card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>Quick Actions</div>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '10px',
                }}>
                    {quickActions.map(a => <QuickAction key={a.href} {...a} />)}
                </div>
            </div>

            {/* ── Charts + Activity ─────────────────────────────────────────── */}
            <div className="dash-mid-grid">
                {/* Charts column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <ChartCard title="Fee Collection & Expenses" subtitle="March 2026 — daily breakdown" height="300px" />
                    <ChartCard title="Fee Collection — Session 2025-26" subtitle="Monthly trend" height="260px" />
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Mini charts */}
                    <ChartCard title="Income — March 2026" height="170px" />
                    <ChartCard title="Expenses — March 2026" height="170px" />

                    {/* Recent activity */}
                    <div className="card" style={{ padding: '20px 22px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>Recent Activity</div>
                            <Link href="/audit" style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div>
                            {activities.map((a, i) => (
                                <ActivityItem key={i} {...a} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
