'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authApi.login(email, password);
            const { access_token, refresh_token, user } = res.data.data;

            setAuth(user, access_token, refresh_token);

            // Also set cookie for middleware
            document.cookie = `access_token=${access_token}; path=/; max-age=900; SameSite=Strict`;

            toast.success(`Welcome back, ${user.first_name}!`);

            const redirect = searchParams.get('redirect') || '/dashboard';
            router.push(redirect);
        } catch (err: any) {
            const msg = err?.response?.data?.error?.message || 'Invalid email or password';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background gradient blobs */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px',
                borderRadius: '50%', top: '-200px', right: '-100px',
                background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', width: '400px', height: '400px',
                borderRadius: '50%', bottom: '-100px', left: '-50px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="animate-fadeIn" style={{
                width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '60px', height: '60px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                        marginBottom: '16px', boxShadow: '0 8px 32px rgba(13,148,136,0.3)',
                    }}>
                        <GraduationCap size={28} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem', fontWeight: 800,
                        color: 'var(--color-text-primary)', margin: '0 0 6px',
                        letterSpacing: '-0.03em',
                    }}>SchoolOS</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        Sign in to your school dashboard
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    padding: '36px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Error alert */}
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                background: 'var(--color-danger-bg)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
                                animation: 'fadeIn 0.2s ease',
                            }}>
                                <AlertCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                                <span style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@yourschool.com"
                                required
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '24px' }}>
                            <label className="form-label" htmlFor="password">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-text-muted)', padding: '2px',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                        >
                            {loading ? (
                                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>
                </div>

                <p style={{
                    textAlign: 'center', marginTop: '24px',
                    fontSize: '0.8125rem', color: 'var(--color-text-muted)',
                }}>
                    Protected by SchoolOS Security • JWT + Role-based Access
                </p>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
