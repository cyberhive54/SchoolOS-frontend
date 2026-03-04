'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    GraduationCap, Edit, Trash2, ArrowLeft, User, MapPin, Phone,
    Heart, FileText, Shield, Loader2, Calendar, Droplet,
    Users, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { EditStudentModal } from '@/components/students/EditStudentModal';

const STATUS_COLORS: Record<string, string> = {
    active: 'badge-success', inactive: 'badge-default',
    transferred: 'badge-warning', withdrawn: 'badge-danger', alumni: 'badge-info',
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', minWidth: '150px', flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: '0.875rem', color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: value ? 500 : 400 }}>
                {value ?? '—'}
            </span>
        </div>
    );
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ color: 'var(--color-brand)', display: 'flex' }}>{icon}</div>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{title}</span>
            </div>
            {children}
        </div>
    );
}

function AddressDisplay({ addr }: { addr?: Record<string, unknown> | null }) {
    if (!addr || !Object.keys(addr).length) return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Not provided</span>;
    const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean);
    return <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{parts.join(', ')}</span>;
}

const TABS = ['Overview', 'Parents / Guardians', 'Documents', 'Attendance History'];

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState(0);
    const [showEdit, setShowEdit] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['student', id],
        queryFn: () => studentsApi.get(id, 'parents,documents'),
        retry: false,
        enabled: !!id,
    });

    const student = data?.data?.data ?? data?.data;

    const deleteMutation = useMutation({
        mutationFn: (reason: string) => studentsApi.softDelete(id, reason),
        onSuccess: () => {
            toast.success('Student record removed');
            qc.invalidateQueries({ queryKey: ['students'] });
            router.replace('/students');
        },
        onError: () => toast.error('Failed to delete student'),
    });

    if (isLoading) {
        return (
            <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader2 size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--color-brand)' }} />
            </div>
        );
    }

    if (error || !student) {
        return (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <GraduationCap size={48} style={{ opacity: 0.3, display: 'block', margin: '0 auto 16px' }} />
                <p>Student not found</p>
                <Link href="/students" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', marginTop: '12px', display: 'inline-flex' }}>
                    ← Back to Students
                </Link>
            </div>
        );
    }

    const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`.toUpperCase();

    return (
        <>
            {showEdit && <EditStudentModal student={student} onClose={() => setShowEdit(false)} />}

            {/* Delete confirm */}
            {showDeleteConfirm && (
                <div className="modal-backdrop">
                    <div className="modal-box" style={{ maxWidth: '420px', padding: '28px' }}>
                        <div style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: '8px' }}>
                            Remove Student Record?
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                            This will soft-delete <strong>{student.first_name} {student.last_name}</strong>'s record. The data is retained and can be recovered by an admin.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => deleteMutation.mutate('Removed by admin')} disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Trash2 size={14} />}
                                {deleteMutation.isPending ? 'Removing…' : 'Yes, Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Back + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <Link href="/students" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                        <ArrowLeft size={15} /> Back to Students
                    </Link>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(true)}>
                            <Edit size={14} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
                            <Trash2 size={14} /> Remove
                        </button>
                    </div>
                </div>

                {/* Profile header card */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        {/* Avatar */}
                        {student.profile_photo_url ? (
                            <img src={student.profile_photo_url} alt={student.first_name}
                                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-border)' }} />
                        ) : (
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', fontWeight: 800, flexShrink: 0,
                            }}>{initials}</div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                                    {student.first_name} {student.last_name}
                                </h1>
                                <span className={`badge ${STATUS_COLORS[student.status] ?? 'badge-default'}`}>{student.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                    <BookOpen size={13} />
                                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-brand-light)', fontWeight: 600 }}>
                                        {student.admission_number}
                                    </span>
                                </div>
                                {student.date_of_birth && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                        <Calendar size={13} />
                                        {format(new Date(student.date_of_birth), 'dd MMM yyyy')}
                                    </div>
                                )}
                                {student.blood_group && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                        <Droplet size={13} />
                                        {student.blood_group}
                                    </div>
                                )}
                                {student.gender && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                        <User size={13} />
                                        {student.gender.charAt(0).toUpperCase() + student.gender.slice(1)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(i)}
                            style={{
                                padding: '10px 20px', border: 'none', background: 'transparent',
                                color: activeTab === i ? 'var(--color-brand)' : 'var(--color-text-muted)',
                                fontWeight: activeTab === i ? 700 : 500, fontSize: '0.875rem',
                                borderBottom: activeTab === i ? '2px solid var(--color-brand)' : '2px solid transparent',
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab: Overview */}
                {activeTab === 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                        <InfoCard title="Personal Information" icon={<User size={16} />}>
                            <InfoRow label="Full Name" value={`${student.first_name} ${student.last_name ?? ''}`} />
                            <InfoRow label="Date of Birth" value={student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMM yyyy') : null} />
                            <InfoRow label="Gender" value={student.gender} />
                            <InfoRow label="Blood Group" value={student.blood_group} />
                            <InfoRow label="Nationality" value={student.nationality} />
                            <InfoRow label="Religion" value={student.religion} />
                            <InfoRow label="Mother Tongue" value={student.mother_tongue} />
                        </InfoCard>

                        <InfoCard title="Admission Details" icon={<BookOpen size={16} />}>
                            <InfoRow label="Admission Number" value={student.admission_number} />
                            <InfoRow label="Admission Date" value={student.admission_date ? format(new Date(student.admission_date), 'dd MMM yyyy') : null} />
                            <InfoRow label="Status" value={student.status} />
                            <InfoRow label="Category" value={student.category_id ?? null} />
                            {student.notes && <InfoRow label="Notes" value={student.notes} />}
                        </InfoCard>

                        <InfoCard title="Current Address" icon={<MapPin size={16} />}>
                            <div style={{ paddingTop: '8px' }}>
                                <AddressDisplay addr={student.current_address} />
                            </div>
                        </InfoCard>

                        <InfoCard title="Emergency Contact" icon={<Phone size={16} />}>
                            <InfoRow label="Name" value={(student.emergency_contact as any)?.name} />
                            <InfoRow label="Phone" value={(student.emergency_contact as any)?.phone} />
                            <InfoRow label="Relation" value={(student.emergency_contact as any)?.relation} />
                        </InfoCard>
                    </div>
                )}

                {/* Tab: Parents */}
                {activeTab === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(student.parents as any[])?.length > 0 ? (
                            (student.parents as any[]).map((p: any, i: number) => (
                                <div key={i} className="card" style={{ padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                                            background: 'var(--color-accent)', opacity: 0.85, color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700,
                                        }}>
                                            {p.first_name?.[0]?.toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{p.first_name} {p.last_name}</div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{p.relation}</div>
                                        </div>
                                        {p.is_primary && <span className="badge badge-brand">Primary Contact</span>}
                                        {p.can_pickup && <span className="badge badge-success">Pickup Auth.</span>}
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                        {p.phone && <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>📞 {p.phone}</span>}
                                        {p.email && <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>✉️ {p.email}</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                                <Users size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                                No parents/guardians linked yet
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Documents (placeholder) */}
                {activeTab === 2 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        <FileText size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                        Document uploads coming soon
                    </div>
                )}

                {/* Tab: Attendance (placeholder) */}
                {activeTab === 3 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                        <Calendar size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                        Attendance history coming soon
                    </div>
                )}
            </div>
        </>
    );
}
