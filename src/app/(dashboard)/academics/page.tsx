'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Plus, ChevronRight } from 'lucide-react';
import { academicsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import type { AcademicYear, Class, Section, Subject } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AcademicsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'timetable'>('overview');

    const { data: yearsData } = useQuery({
        queryKey: ['academic-years'],
        queryFn: () => academicsApi.listYears(),
        retry: false,
    });

    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: () => academicsApi.listClasses(),
        retry: false,
    });

    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: () => academicsApi.listSubjects(),
        retry: false,
    });

    const classes: Class[] = classesData?.data?.data ?? [];
    const subjects: Subject[] = subjectsData?.data?.data ?? [];
    const years: AcademicYear[] = yearsData?.data?.data ?? [];
    const currentYear = years.find(y => y.is_current);

    return (
        <>
            <Header title="Academics" subtitle="Classes, subjects, timetables and exams" />

            <div style={{ padding: '28px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
                    {(['overview', 'timetable'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '7px 20px', borderRadius: '7px', cursor: 'pointer', border: 'none',
                                background: activeTab === tab ? 'var(--color-brand)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--color-text-secondary)',
                                fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize',
                                transition: 'all 0.15s',
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <>
                        {/* Current Year Banner */}
                        {currentYear && (
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(59,130,246,0.08))',
                                border: '1px solid rgba(13,148,136,0.3)', borderRadius: '12px',
                                padding: '16px 24px', marginBottom: '20px',
                                display: 'flex', alignItems: 'center', gap: '16px',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Current Academic Year</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-brand-light)', marginTop: '2px' }}>{currentYear.name}</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                        {currentYear.start_date} → {currentYear.end_date}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Classes */}
                            <div className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Classes</h2>
                                    <button className="btn btn-primary btn-sm"><Plus size={13} />Add</button>
                                </div>
                                {classes.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No classes configured yet</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {classes.map(cls => (
                                            <div key={cls.id} style={{
                                                display: 'flex', alignItems: 'center', padding: '10px 12px',
                                                borderRadius: '8px', background: 'var(--color-bg-elevated)',
                                                cursor: 'pointer', transition: 'border-color 0.15s',
                                                border: '1px solid transparent',
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-brand)')}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                                            >
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13,148,136,0.15)', color: 'var(--color-brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', marginRight: '12px', flexShrink: 0 }}>
                                                    {cls.numeric_value ?? '?'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{cls.name}</div>
                                                    {cls.board && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{cls.board}</div>}
                                                </div>
                                                <ChevronRight size={14} color="var(--color-text-muted)" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Subjects */}
                            <div className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Subjects</h2>
                                    <button className="btn btn-primary btn-sm"><Plus size={13} />Add</button>
                                </div>
                                {subjects.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No subjects configured yet</p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {subjects.map(sub => (
                                            <div key={sub.id} style={{
                                                padding: '6px 14px', borderRadius: '99px',
                                                background: sub.is_elective ? 'rgba(139,92,246,0.12)' : 'rgba(13,148,136,0.1)',
                                                color: sub.is_elective ? '#A78BFA' : 'var(--color-brand-light)',
                                                border: `1px solid ${sub.is_elective ? 'rgba(139,92,246,0.3)' : 'rgba(13,148,136,0.3)'}`,
                                                fontSize: '0.8125rem', fontWeight: 600,
                                            }}>
                                                {sub.name} {sub.is_elective && <span style={{ opacity: 0.7 }}>(elective)</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'timetable' && (
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <select className="form-input" style={{ width: 'auto' }}>
                                <option>— Select Section —</option>
                            </select>
                            <select className="form-input" style={{ width: 'auto' }}>
                                <option>— Academic Year —</option>
                            </select>
                        </div>

                        {/* Timetable grid */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: 'var(--color-bg-elevated)', padding: '10px 14px', textAlign: 'center', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', width: '60px' }}>Period</th>
                                        {DAYS.map(day => (
                                            <th key={day} style={{ background: 'var(--color-bg-elevated)', padding: '10px 14px', textAlign: 'center', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', fontWeight: 700 }}>{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {PERIODS.map(period => (
                                        <tr key={period}>
                                            <td style={{ background: 'var(--color-bg-elevated)', padding: '10px 14px', textAlign: 'center', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>P{period}</td>
                                            {DAYS.map(day => (
                                                <td key={day} style={{ padding: '8px', border: '1px solid var(--color-border)', height: '60px', verticalAlign: 'middle', textAlign: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,148,136,0.08)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                                >
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>—</div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            Select a section and academic year to view/edit the timetable
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
