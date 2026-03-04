'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, DollarSign, BookOpen, CalendarCheck,
    ClipboardList, Building2, ChevronLeft, ChevronRight,
    GraduationCap, Bus, MessageSquare, Settings, Bell, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { NavItem } from '@/types';

// ── Navigation config ─────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    {
        id: 'dashboard', label: 'Dashboard', href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        id: 'front-office', label: 'Front Office', href: '/front-office',
        icon: Building2,
        children: [
            { id: 'fo-enquiries', label: 'Enquiries', href: '/front-office/enquiries', icon: ClipboardList },
            { id: 'fo-visitors', label: 'Visitor Log', href: '/front-office/visitors', icon: Users },
        ],
    },
    {
        id: 'students', label: 'Students', href: '/students',
        icon: GraduationCap,
    },
    {
        id: 'fees', label: 'Fees', href: '/fees',
        icon: DollarSign,
        children: [
            { id: 'fees-invoices', label: 'Invoices', href: '/fees/invoices', icon: ClipboardList },
        ],
    },
    {
        id: 'academics', label: 'Academics', href: '/academics',
        icon: BookOpen,
        children: [
            { id: 'academics-timetable', label: 'Timetable', href: '/academics/timetable', icon: CalendarCheck },
        ],
    },
    {
        id: 'attendance', label: 'Attendance', href: '/attendance',
        icon: CalendarCheck,
    },
    {
        id: 'transport', label: 'Transport', href: '/transport',
        icon: Bus,
    },
    {
        id: 'communication', label: 'Communication', href: '/communication',
        icon: MessageSquare,
    },
];

const BOTTOM_ITEMS: NavItem[] = [
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

// ── SidebarItem ───────────────────────────────────────────────────────────────

interface SidebarItemProps {
    item: NavItem;
    collapsed: boolean;
    depth?: number;
}

function SidebarItem({ item, collapsed, depth = 0 }: SidebarItemProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasChildren = item.children && item.children.length > 0;

    // Auto-open parent when child is active
    useEffect(() => {
        if (hasChildren && item.children?.some(c => pathname.startsWith(c.href))) {
            setOpen(true);
        }
    }, [pathname]);

    const content = (
        <div
            className="sidebar-item"
            style={{ position: 'relative' }}
            onClick={() => hasChildren && !collapsed && setOpen(o => !o)}
        >
            <Link
                href={hasChildren ? '#' : item.href}
                onClick={e => hasChildren && e.preventDefault()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '11px 0' : `11px ${16 + depth * 12}px`,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    margin: '2px 8px',
                    color: isActive ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                    background: isActive ? 'rgba(13, 148, 136, 0.12)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderLeft: isActive && !collapsed ? '2px solid var(--color-brand)' : '2px solid transparent',
                    position: 'relative',
                }}
                onMouseEnter={e => {
                    if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-elevated)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
                    }
                }}
                onMouseLeave={e => {
                    if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                    }
                }}
            >
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <Icon size={18} />
                </div>

                {/* Tooltip when collapsed */}
                {collapsed && (
                    <span className="sidebar-tooltip">{item.label}</span>
                )}

                {!collapsed && (
                    <>
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>
                        {item.badge && (
                            <span style={{
                                background: 'var(--color-brand)', color: 'white',
                                borderRadius: '99px', fontSize: '0.6875rem',
                                fontWeight: 700, padding: '1px 7px', minWidth: '20px', textAlign: 'center',
                            }}>{item.badge}</span>
                        )}
                        {hasChildren && (
                            <ChevronRight
                                size={14}
                                style={{
                                    transform: open ? 'rotate(90deg)' : 'none',
                                    transition: 'transform 0.2s',
                                    flexShrink: 0,
                                    color: 'var(--color-text-muted)',
                                }}
                            />
                        )}
                    </>
                )}
            </Link>
        </div>
    );

    return (
        <div>
            {content}
            {/* Sub-items */}
            {hasChildren && !collapsed && open && (
                <div style={{ overflow: 'hidden' }}>
                    {item.children!.map(child => (
                        <SidebarItem key={child.id} item={child} collapsed={collapsed} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({ collapsed }: { collapsed: boolean }) {
    const { user, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        window.location.href = '/login';
    };

    return (
        <nav
            className={`sidebar-nav${collapsed ? ' collapsed' : ''}`}
            aria-label="Main navigation"
            style={{
                width: collapsed ? '80px' : '260px',
                backgroundColor: '#ffffff',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease',
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? '0' : '0 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderBottom: '1px solid var(--color-border)',
                flexShrink: 0,
            }}>
                <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                }}>S</div>
                {!collapsed && (
                    <span style={{
                        marginLeft: '10px', fontWeight: 700, fontSize: '1rem',
                        color: 'var(--color-text-primary)', letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap',
                    }}>SchoolOS</span>
                )}
            </div>

            {/* Nav items */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
                {!collapsed && (
                    <div style={{
                        padding: '8px 16px 4px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                    }}>MAIN</div>
                )}
                {NAV_ITEMS.map(item => (
                    <SidebarItem key={item.id} item={item} collapsed={collapsed} />
                ))}
            </div>

            {/* Bottom: user + toggle */}
            <div style={{
                borderTop: '1px solid var(--color-border)',
                padding: '8px 0',
                flexShrink: 0,
            }}>
                {BOTTOM_ITEMS.map(item => (
                    <SidebarItem key={item.id} item={item} collapsed={collapsed} />
                ))}

                {/* Logout */}
                <div className="sidebar-item" style={{ position: 'relative' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: collapsed ? '11px 0' : '11px 16px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            borderRadius: '8px', margin: '2px 8px', width: 'calc(100% - 16px)',
                            color: 'var(--color-danger)', background: 'transparent',
                            border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-danger-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <LogOut size={18} style={{ flexShrink: 0 }} />
                        {collapsed && <span className="sidebar-tooltip">Logout</span>}
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>

                {/* User info */}
                {!collapsed && user && (
                    <div style={{
                        margin: '4px 8px 4px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--color-bg-elevated)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: 'var(--color-brand)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0,
                        }}>
                            {user.first_name[0]?.toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.first_name} {user.last_name}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                {user.role.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

// Export a hook to share sidebar state if needed
export { };
