'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Check, Loader2 } from 'lucide-react';

const schema = z.object({
    first_name: z.string().min(2, 'Minimum 2 characters').max(100),
    last_name: z.string().max(100).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
    nationality: z.string().max(100).optional(),
    religion: z.string().max(100).optional(),
    mother_tongue: z.string().max(100).optional(),
    notes: z.string().optional(),
    current_address: z.object({
        line1: z.string().optional(), city: z.string().optional(),
        state: z.string().optional(), postal_code: z.string().optional(),
    }).optional(),
    emergency_contact: z.object({
        name: z.string().optional(), phone: z.string().optional(), relation: z.string().optional(),
    }).optional(),
});

type EditForm = z.infer<typeof schema>;

interface EditStudentModalProps {
    student: any;
    onClose: () => void;
}

export function EditStudentModal({ student, onClose }: EditStudentModalProps) {
    const qc = useQueryClient();

    const form = useForm<EditForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            first_name: student.first_name ?? '',
            last_name: student.last_name ?? '',
            gender: student.gender ?? undefined,
            blood_group: student.blood_group ?? undefined,
            nationality: student.nationality ?? '',
            religion: student.religion ?? '',
            mother_tongue: student.mother_tongue ?? '',
            notes: student.notes ?? '',
            current_address: student.current_address ?? {},
            emergency_contact: student.emergency_contact ?? {},
        },
    });

    const { register, handleSubmit, formState: { errors } } = form;

    const mutation = useMutation({
        mutationFn: (data: EditForm) => studentsApi.update(student.id, {
            ...data,
            gender: data.gender || undefined,
            blood_group: data.blood_group || undefined,
        }),
        onSuccess: () => {
            toast.success('Student updated');
            qc.invalidateQueries({ queryKey: ['student', student.id] });
            qc.invalidateQueries({ queryKey: ['students'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.error?.message ?? 'Update failed');
        },
    });

    const onSubmit = handleSubmit(data => mutation.mutate(data));

    return (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box" style={{ maxWidth: '620px', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>Edit Student — {student.first_name} {student.last_name}</div>
                    <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={18} /></button>
                </div>

                <form onSubmit={onSubmit}>
                    <div style={{ padding: '20px 24px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Basic */}
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Basic Information</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">First Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                                <input {...register('first_name')} className="form-input" />
                                {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
                            </div>
                            <div>
                                <label className="form-label">Last Name</label>
                                <input {...register('last_name')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Gender</label>
                                <select {...register('gender')} className="form-input">
                                    <option value="">Select…</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Blood Group</label>
                                <select {...register('blood_group')} className="form-input">
                                    <option value="">Select…</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Nationality</label>
                                <input {...register('nationality')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Religion</label>
                                <input {...register('religion')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Mother Tongue</label>
                                <input {...register('mother_tongue')} className="form-input" />
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '8px' }}>Current Address</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Address Line 1</label>
                                <input {...register('current_address.line1')} className="form-input" placeholder="Street, area" />
                            </div>
                            <div>
                                <label className="form-label">City</label>
                                <input {...register('current_address.city')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">State</label>
                                <input {...register('current_address.state')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">PIN Code</label>
                                <input {...register('current_address.postal_code')} className="form-input" />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '8px' }}>Emergency Contact</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="form-label">Name</label>
                                <input {...register('emergency_contact.name')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Phone</label>
                                <input {...register('emergency_contact.phone')} className="form-input" />
                            </div>
                            <div>
                                <label className="form-label">Relation</label>
                                <input {...register('emergency_contact.relation')} className="form-input" placeholder="Father" />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="form-label">Internal Notes</label>
                            <textarea {...register('notes')} className="form-input" rows={2} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid var(--color-border)' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={mutation.isPending}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                            {mutation.isPending
                                ? <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Saving…</>
                                : <><Check size={14} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
