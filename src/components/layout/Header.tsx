'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, User, KeyRound, LogOut, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onMobileMenuOpen: () => void;
}

// Build breadcrumb from pathname
function useBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((seg, i) => ({
        label: seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        href: '/' + segments.slice(0, i + 1).join('/'),
    }));
}

export function Header({ sidebarCollapsed, onToggleSidebar, onMobileMenuOpen }: HeaderProps) {
    const { user, clearAuth } = useAuthStore();
    const { theme } = useThemeStore();
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const breadcrumb = useBreadcrumb();

    // Close dropdowns on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        clearAuth();
        window.location.href = '/login';
    };

    const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : '?';
    const fullName = user ? `${user.first_name} ${user.last_name}` : 'User';
    const roleLabel = user?.role?.replace(/_/g, ' ') ?? '';

    return (
        <header style={{
            height: '64px',
            background: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            gap: '12px',
            flexShrink: 0,
        }}>
            {/* Desktop sidebar toggle */}
            <button
                onClick={onToggleSidebar}
                className="desktop-only"
                style={{
                    width: '36px', height: '36px', border: 'none', background: 'transparent',
                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--color-text-secondary)',
                    transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {/* Mobile hamburger */}
            <button
                onClick={onMobileMenuOpen}
                className="mobile-only"
                style={{
                    width: '36px', height: '36px', border: 'none', background: 'transparent',
                    borderRadius: '8px', cursor: 'pointer', display: 'none', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--color-text-secondary)',
                }}
            >
                <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                {breadcrumb.map((crumb, i) => (
                    <React.Fragment key={crumb.href}>
                        {i > 0 && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>/</span>}
                        <Link
                            href={crumb.href}
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                                color: i === breadcrumb.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                textDecoration: 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {crumb.label}
                        </Link>
                    </React.Fragment>
                ))}
            </nav>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

                {/* Notifications bell */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                        style={{
                            width: '36px', height: '36px', border: 'none', background: 'transparent',
                            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'var(--color-text-secondary)',
                            position: 'relative',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-elevated)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                        title="Notifications"
                    >
                        <Bell size={18} />
                        {/* Unread dot */}
                        <span style={{
                            position: 'absolute', top: '7px', right: '7px',
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: 'var(--color-brand)', border: '1.5px solid var(--color-bg-surface)',
                        }} />
                    </button>

                    {notifOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            width: '320px', background: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)', borderRadius: '12px',
                            boxShadow: 'var(--shadow-dropdown)', zIndex: 50,
                            animation: 'fadeIn 0.15s ease',
                        }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>Notifications</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-brand)', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
                            </div>
                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {[
                                    { title: 'Fee overdue reminder sent', time: '2 min ago', dot: 'var(--color-warning)' },
                                    { title: '3 new admission enquiries', time: '1 hr ago', dot: 'var(--color-brand)' },
                                    { title: 'Attendance marked for Class 5A', time: '3 hr ago', dot: 'var(--color-success)' },
                                ].map((n, i) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px',
                                        cursor: 'pointer', alignItems: 'flex-start',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.dot, marginTop: '5px', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{n.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{n.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: '8px 16px 12px', textAlign: 'center' }}>
                                <Link href="/notifications" style={{ fontSize: '0.8125rem', color: 'var(--color-brand)', fontWeight: 600, textDecoration: 'none' }}>
                                    View all notifications
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '5px 6px 5px 4px', border: '1px solid var(--color-border)',
                            background: profileOpen ? 'var(--color-bg-elevated)' : 'transparent',
                            borderRadius: '10px', cursor: 'pointer',
                            transition: 'background 0.15s, border-color 0.15s',
                            color: 'var(--color-text-primary)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-elevated)'; e.currentTarget.style.borderColor = 'var(--color-brand)'; }}
                        onMouseLeave={e => {
                            if (!profileOpen) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                            }
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                        <div className="header-profile-name" style={{ textAlign: 'left', overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                {fullName}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                {roleLabel}
                            </div>
                        </div>
                        <ChevronDown size={13} style={{
                            color: 'var(--color-text-muted)', flexShrink: 0,
                            transform: profileOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                        }} />
                    </button>

                    {profileOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            width: '220px', background: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)', borderRadius: '12px',
                            boxShadow: 'var(--shadow-dropdown)', zIndex: 50,
                            animation: 'fadeIn 0.15s ease',
                            overflow: 'hidden',
                        }}>
                            {/* User info header */}
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{fullName}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', textTransform: 'capitalize' }}>{roleLabel}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                            </div>

                            {/* Menu items */}
                            <div style={{ padding: '6px' }}>
                                {[
                                    { label: 'My Profile', icon: User, href: '/profile' },
                                    { label: 'Change Password', icon: KeyRound, href: '/profile/password' },
                                    { label: 'System Settings', icon: Settings, href: '/settings' },
                                ].map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setProfileOpen(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '9px 10px', borderRadius: '8px',
                                            color: 'var(--color-text-secondary)',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem', fontWeight: 500,
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--color-bg-elevated)'; el.style.color = 'var(--color-text-primary)'; }}
                                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--color-text-secondary)'; }}
                                    >
                                        <item.icon size={15} />
                                        {item.label}
                                    </Link>
                                ))}

                                {/* Divider */}
                                <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '9px 10px', borderRadius: '8px', width: '100%',
                                        color: 'var(--color-danger)', background: 'transparent',
                                        border: 'none', cursor: 'pointer',
                                        fontSize: '0.875rem', fontWeight: 500,
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <LogOut size={15} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
