'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentsApi, academicsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
    X, ChevronRight, ChevronLeft, User, MapPin, Users, Check,
    Loader2, AlertCircle,
} from 'lucide-react';

// ── Zod schemas matching CreateStudentDto exactly ─────────────────────────────

const addressSchema = z.object({
    line1: z.string().max(200).optional(),
    line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postal_code: z.string().max(10).optional(),
    country: z.string().default('India'),
});

const parentSchema = z.object({
    first_name: z.string().min(1, 'Required').max(100),
    last_name: z.string().max(100).optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().min(10, 'Enter valid phone').max(15).optional(),
    relation: z.enum(['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other']),
    is_primary: z.boolean().default(true),
    can_pickup: z.boolean().default(true),
});

const studentSchema = z.object({
    // Step 1: Basic Info
    first_name: z.string().min(2, 'Minimum 2 characters').max(100),
    last_name: z.string().max(100).optional(),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other']).optional(),
    blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
    nationality: z.string().max(100).optional(),
    religion: z.string().max(100).optional(),
    mother_tongue: z.string().max(100).optional(),
    admission_date: z.string().optional(),
    admission_number: z.string().max(50).optional(),
    category_id: z.string().uuid().optional().or(z.literal('')),
    notes: z.string().optional(),
    // Step 2: Address
    current_address: addressSchema.optional(),
    permanent_address: addressSchema.optional(),
    emergency_contact: z.object({
        name: z.string().max(200).optional(),
        phone: z.string().max(20).optional(),
        relation: z.string().max(50).optional(),
    }).optional(),
    // Step 3: Parents
    parents: z.array(parentSchema).optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

// ── Steps ─────────────────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'Basic Info', icon: User },
    { id: 2, label: 'Address', icon: MapPin },
    { id: 3, label: 'Parents', icon: Users },
];

// ── Field helpers ─────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <AlertCircle size={11} color="var(--color-danger)" />
            <span className="form-error" style={{ marginTop: 0 }}>{msg}</span>
        </div>
    );
}

function FormRow({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px' }}>
            {children}
        </div>
    );
}

function Field({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
    return (
        <div>
            <label className="form-label">
                {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
            </label>
            {children}
            <FieldError msg={error} />
        </div>
    );
}

// ── Step 1: Basic Info ────────────────────────────────────────────────────────
function StepBasic({ form, categories }: { form: ReturnType<typeof useForm<StudentForm>>; categories: { id: string; name: string }[] }) {
    const { register, formState: { errors } } = form;
    const e = errors;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormRow>
                <Field label="First Name" required error={e.first_name?.message}>
                    <input {...register('first_name')} className="form-input" placeholder="Rahul" />
                </Field>
                <Field label="Last Name" error={e.last_name?.message}>
                    <input {...register('last_name')} className="form-input" placeholder="Sharma" />
                </Field>
            </FormRow>

            <FormRow>
                <Field label="Date of Birth" required error={e.date_of_birth?.message}>
                    <input {...register('date_of_birth')} type="date" className="form-input" />
                </Field>
                <Field label="Admission Date" error={e.admission_date?.message}>
                    <input {...register('admission_date')} type="date" className="form-input" />
                </Field>
            </FormRow>

            <FormRow>
                <Field label="Gender" error={e.gender?.message}>
                    <select {...register('gender')} className="form-input">
                        <option value="">Select gender…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </Field>
                <Field label="Blood Group" error={e.blood_group?.message}>
                    <select {...register('blood_group')} className="form-input">
                        <option value="">Select…</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </Field>
            </FormRow>

            <FormRow>
                <Field label="Admission Number" error={e.admission_number?.message}>
                    <input {...register('admission_number')} className="form-input" placeholder="Auto-generated if blank" />
                </Field>
                <Field label="Category">
                    <select {...register('category_id')} className="form-input">
                        <option value="">None</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </Field>
            </FormRow>

            <FormRow cols={3}>
                <Field label="Nationality" error={e.nationality?.message}>
                    <input {...register('nationality')} className="form-input" placeholder="Indian" />
                </Field>
                <Field label="Religion" error={e.religion?.message}>
                    <input {...register('religion')} className="form-input" placeholder="Optional" />
                </Field>
                <Field label="Mother Tongue" error={e.mother_tongue?.message}>
                    <input {...register('mother_tongue')} className="form-input" placeholder="Hindi" />
                </Field>
            </FormRow>

            <Field label="Internal Notes" error={e.notes?.message}>
                <textarea {...register('notes')} className="form-input" rows={2} placeholder="Any remarks for staff…" />
            </Field>
        </div>
    );
}

// ── Step 2: Address ───────────────────────────────────────────────────────────
function AddressBlock({ prefix, label, form }: { prefix: 'current_address' | 'permanent_address'; label: string; form: ReturnType<typeof useForm<StudentForm>> }) {
    const { register } = form;
    return (
        <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <FormRow>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <input {...register(`${prefix}.line1`)} className="form-input" placeholder="Address line 1" />
                    </div>
                </FormRow>
                <FormRow cols={3}>
                    <input {...register(`${prefix}.city`)} className="form-input" placeholder="City" />
                    <input {...register(`${prefix}.state`)} className="form-input" placeholder="State" />
                    <input {...register(`${prefix}.postal_code`)} className="form-input" placeholder="PIN Code" />
                </FormRow>
            </div>
        </div>
    );
}

function StepAddress({ form }: { form: ReturnType<typeof useForm<StudentForm>> }) {
    const { register } = form;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AddressBlock prefix="current_address" label="Current Address" form={form} />
            <AddressBlock prefix="permanent_address" label="Permanent Address (if different)" form={form} />

            <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Emergency Contact</div>
                <FormRow cols={3}>
                    <div>
                        <label className="form-label">Name</label>
                        <input {...register('emergency_contact.name')} className="form-input" placeholder="Dr. Patel" />
                    </div>
                    <div>
                        <label className="form-label">Phone</label>
                        <input {...register('emergency_contact.phone')} className="form-input" placeholder="+91 9876543210" />
                    </div>
                    <div>
                        <label className="form-label">Relation</label>
                        <input {...register('emergency_contact.relation')} className="form-input" placeholder="Father" />
                    </div>
                </FormRow>
            </div>
        </div>
    );
}

// ── Step 3: Parents ───────────────────────────────────────────────────────────
function StepParents({ form }: { form: ReturnType<typeof useForm<StudentForm>> }) {
    const { register, watch, setValue, formState: { errors } } = form;
    const parents = watch('parents') ?? [];
    const e = errors.parents;

    const addParent = () => {
        setValue('parents', [
            ...parents,
            { first_name: '', last_name: '', email: '', phone: '', relation: 'father', is_primary: parents.length === 0, can_pickup: true },
        ]);
    };

    const removeParent = (idx: number) => {
        setValue('parents', parents.filter((_, i) => i !== idx));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {parents.map((_, idx) => (
                <div key={idx} style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: '10px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            Guardian {idx + 1}
                        </span>
                        <button type="button" onClick={() => removeParent(idx)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                            <X size={14} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <FormRow>
                            <div>
                                <label className="form-label">First Name <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                                <input {...register(`parents.${idx}.first_name`)} className="form-input" placeholder="Rajesh" />
                                <FieldError msg={e?.[idx]?.first_name?.message} />
                            </div>
                            <div>
                                <label className="form-label">Last Name</label>
                                <input {...register(`parents.${idx}.last_name`)} className="form-input" placeholder="Sharma" />
                            </div>
                        </FormRow>
                        <FormRow>
                            <div>
                                <label className="form-label">Phone</label>
                                <input {...register(`parents.${idx}.phone`)} className="form-input" placeholder="+91 9876543210" type="tel" />
                                <FieldError msg={e?.[idx]?.phone?.message} />
                            </div>
                            <div>
                                <label className="form-label">Email</label>
                                <input {...register(`parents.${idx}.email`)} className="form-input" placeholder="parent@email.com" type="email" />
                                <FieldError msg={e?.[idx]?.email?.message} />
                            </div>
                        </FormRow>
                        <FormRow cols={3}>
                            <div>
                                <label className="form-label">Relation <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                                <select {...register(`parents.${idx}.relation`)} className="form-input">
                                    {['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other'].map(r => (
                                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '24px' }}>
                                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '0.8125rem' }}>
                                    <input {...register(`parents.${idx}.is_primary`)} type="checkbox" />
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Primary contact</span>
                                </label>
                                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '0.8125rem' }}>
                                    <input {...register(`parents.${idx}.can_pickup`)} type="checkbox" defaultChecked />
                                    <span style={{ color: 'var(--color-text-secondary)' }}>Authorized pickup</span>
                                </label>
                            </div>
                        </FormRow>
                    </div>
                </div>
            ))}

            <button type="button" onClick={addParent} className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                + Add Guardian / Parent
            </button>

            {parents.length === 0 && (
                <p className="form-hint" style={{ textAlign: 'center', paddingBottom: '8px' }}>
                    You can also add parents later from the student profile.
                </p>
            )}
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
interface AddStudentModalProps {
    onClose: () => void;
    prefillData?: Partial<StudentForm>; // For enquiry → admission flow
}

export function AddStudentModal({ onClose, prefillData }: AddStudentModalProps) {
    const [step, setStep] = useState(1);
    const qc = useQueryClient();

    const { data: categoriesData } = useQuery({
        queryKey: ['student-categories'],
        queryFn: () => studentsApi.listCategories(),
        retry: false,
    });
    const categories: { id: string; name: string }[] = categoriesData?.data?.data ?? [];

    const form = useForm<StudentForm>({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            nationality: 'Indian',
            admission_date: new Date().toISOString().split('T')[0],
            parents: [],
            ...prefillData,
        },
    });

    const { handleSubmit, trigger, formState: { errors, isSubmitting } } = form;

    const mutation = useMutation({
        mutationFn: (data: StudentForm) => {
            // Clean empty strings / empty optionals before sending
            const payload: Record<string, unknown> = {
                first_name: data.first_name,
                last_name: data.last_name || undefined,
                date_of_birth: data.date_of_birth,
                gender: data.gender || undefined,
                blood_group: data.blood_group || undefined,
                nationality: data.nationality || undefined,
                religion: data.religion || undefined,
                mother_tongue: data.mother_tongue || undefined,
                admission_date: data.admission_date || undefined,
                admission_number: data.admission_number || undefined,
                category_id: data.category_id || undefined,
                notes: data.notes || undefined,
                current_address: data.current_address,
                permanent_address: data.permanent_address,
                emergency_contact: data.emergency_contact,
                parents: data.parents?.filter(p => p.first_name).map(p => ({
                    ...p,
                    email: p.email || undefined,
                })) || [],
            };
            return studentsApi.create(payload);
        },
        onSuccess: () => {
            toast.success('Student added successfully!');
            qc.invalidateQueries({ queryKey: ['students'] });
            onClose();
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.error?.message ?? 'Failed to add student. Please check your input.';
            toast.error(msg);
        },
    });

    const onSubmit = handleSubmit((data) => mutation.mutate(data));

    // Validate only the current step's fields before advancing
    const STEP_FIELDS: Record<number, (keyof StudentForm)[]> = {
        1: ['first_name', 'last_name', 'date_of_birth', 'gender', 'blood_group', 'nationality', 'admission_date'],
        2: ['current_address', 'permanent_address', 'emergency_contact'],
        3: ['parents'],
    };

    const next = async () => {
        const valid = await trigger(STEP_FIELDS[step]);
        if (valid) setStep(s => s + 1);
    };

    const back = () => setStep(s => s - 1);

    return (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-box" style={{ width: '100%', maxWidth: '680px' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
                }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-text-primary)' }}>
                            Add New Student
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            Step {step} of {STEPS.length}
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-icon" disabled={isSubmitting || mutation.isPending}>
                        <X size={18} />
                    </button>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', padding: '16px 24px 0', gap: '0' }}>
                    {STEPS.map((s, i) => {
                        const done = step > s.id;
                        const active = step === s.id;
                        const Icon = s.icon;
                        return (
                            <React.Fragment key={s.id}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: done ? 'var(--color-success)' : active ? 'var(--color-brand)' : 'var(--color-bg-elevated)',
                                        color: done || active ? 'white' : 'var(--color-text-muted)',
                                        border: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                    }}>
                                        {done ? <Check size={14} /> : <Icon size={14} />}
                                    </div>
                                    <span style={{
                                        fontSize: '0.6875rem', fontWeight: active ? 700 : 500,
                                        color: active ? 'var(--color-brand)' : done ? 'var(--color-success)' : 'var(--color-text-muted)',
                                    }}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: '2px', background: done ? 'var(--color-success)' : 'var(--color-border)', margin: '15px 0 auto', transition: 'background 0.3s' }} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Form content */}
                <form onSubmit={onSubmit}>
                    <div style={{ padding: '20px 24px', maxHeight: '58vh', overflowY: 'auto' }}>
                        {step === 1 && <StepBasic form={form} categories={categories} />}
                        {step === 2 && <StepAddress form={form} />}
                        {step === 3 && <StepParents form={form} />}
                    </div>

                    {/* Footer */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 24px', borderTop: '1px solid var(--color-border)',
                    }}>
                        <button type="button" onClick={back} className="btn btn-secondary" disabled={step === 1 || mutation.isPending}>
                            <ChevronLeft size={15} /> Back
                        </button>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={mutation.isPending}>
                                Cancel
                            </button>
                            {step < STEPS.length ? (
                                <button type="button" onClick={next} className="btn btn-primary">
                                    Next <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                                    {mutation.isPending ? <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Saving…</> : <><Check size={14} /> Add Student</>}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
