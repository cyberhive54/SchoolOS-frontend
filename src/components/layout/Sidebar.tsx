'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Users, DollarSign, BookOpen, CalendarCheck,
    ClipboardList, Building2, ChevronRight, GraduationCap, Bus,
    MessageSquare, Settings, Shield, Palette, Bell, LibraryBig,
    ClipboardCheck, X,
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import type { NavItem } from '@/types';

// ── Navigation config ──────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
        id: 'front-office', label: 'Front Office', href: '/front-office', icon: Building2,
        children: [
            { id: 'fo-enquiries', label: 'Enquiries', href: '/front-office/enquiries', icon: ClipboardList },
            { id: 'fo-visitors', label: 'Visitor Log', href: '/front-office/visitors', icon: Users },
        ],
    },
    { id: 'students', label: 'Students', href: '/students', icon: GraduationCap },
    {
        id: 'fees', label: 'Fees', href: '/fees', icon: DollarSign,
        children: [
            { id: 'fees-invoices', label: 'Invoices', href: '/fees/invoices', icon: ClipboardList },
        ],
    },
    {
        id: 'academics', label: 'Academics', href: '/academics', icon: BookOpen,
        children: [
            { id: 'academics-timetable', label: 'Timetable', href: '/academics/timetable', icon: CalendarCheck },
        ],
    },
    { id: 'attendance', label: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { id: 'transport', label: 'Transport', href: '/transport', icon: Bus },
    { id: 'communication', label: 'Communication', href: '/communication', icon: MessageSquare },
    { id: 'library', label: 'Library', href: '/library', icon: LibraryBig },
    {
        id: 'settings', label: 'System Settings', href: '/settings', icon: Settings,
        children: [
            { id: 'settings-general', label: 'General', href: '/settings/general', icon: Settings },
            { id: 'settings-users', label: 'Users & Roles', href: '/settings/users', icon: Shield },
            { id: 'settings-theme', label: 'Theme & Branding', href: '/settings/theme', icon: Palette },
            { id: 'settings-notif', label: 'Notifications', href: '/settings/notifications', icon: Bell },
        ],
    },
];

// ── SidebarItem ────────────────────────────────────────────────────────────────
function SidebarItem({ item, collapsed, depth = 0 }: { item: NavItem; collapsed: boolean; depth?: number }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const hasChildren = !!item.children?.length;

    useEffect(() => {
        if (hasChildren && item.children?.some(c => pathname.startsWith(c.href))) setOpen(true);
    }, [pathname, hasChildren, item.children]);

    const itemStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: collapsed ? '10px 0' : `10px ${14 + depth * 12}px`,
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: '8px',
        margin: '1px 8px',
        color: isActive ? 'var(--color-brand-light)' : 'var(--sidebar-text)',
        background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
        textDecoration: 'none',
        fontSize: depth > 0 ? '0.8125rem' : '0.875rem',
        fontWeight: isActive ? 600 : 500,
        cursor: 'pointer',
        userSelect: 'none',
        borderLeft: isActive && !collapsed && depth === 0 ? '2px solid var(--color-brand)' : '2px solid transparent',
        transition: 'all 0.15s',
        position: 'relative',
    };

    const handleClick = (e: React.MouseEvent) => {
        if (hasChildren && !collapsed) {
            e.preventDefault();
            setOpen(o => !o);
        }
    };

    return (
        <div>
            <div className="sidebar-item" style={{ position: 'relative' }}>
                <Link
                    href={hasChildren ? '#' : item.href}
                    onClick={handleClick}
                    style={itemStyle}
                    onMouseEnter={e => {
                        if (!isActive) {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = 'rgba(255,255,255,0.06)';
                            el.style.color = 'var(--sidebar-text-active)';
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isActive) {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = 'transparent';
                            el.style.color = 'var(--sidebar-text)';
                        }
                    }}
                >
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <Icon size={depth > 0 ? 15 : 17} />
                    </div>

                    {collapsed && <span className="sidebar-tooltip">{item.label}</span>}

                    {!collapsed && (
                        <>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                            </span>
                            {item.badge && (
                                <span style={{
                                    background: 'var(--color-brand)', color: 'white',
                                    borderRadius: '99px', fontSize: '0.6875rem',
                                    fontWeight: 700, padding: '1px 7px',
                                }}>{item.badge}</span>
                            )}
                            {hasChildren && (
                                <ChevronRight size={13} style={{
                                    transform: open ? 'rotate(90deg)' : 'none',
                                    transition: 'transform 0.2s',
                                    flexShrink: 0,
                                    color: 'var(--sidebar-text)',
                                    opacity: 0.6,
                                }} />
                            )}
                        </>
                    )}
                </Link>
            </div>
            {hasChildren && !collapsed && open && (
                <div>
                    {item.children!.map(child => (
                        <SidebarItem key={child.id} item={child} collapsed={collapsed} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onToggleCollapse: () => void;
    onMobileClose: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
    const { theme } = useThemeStore();

    return (
        <nav
            className={`sidebar-nav${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
            aria-label="Main navigation"
            style={{
                width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
            }}
        >
            {/* Logo & school name */}
            <div style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? '0' : '0 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderBottom: '1px solid var(--sidebar-border)',
                flexShrink: 0,
                gap: '12px',
            }}>
                {/* Logo / icon */}
                {theme.schoolLogo && !collapsed ? (
                    <img src={theme.schoolLogo} alt={theme.schoolName}
                        style={{ height: '36px', maxWidth: '120px', objectFit: 'contain' }} />
                ) : theme.schoolIcon ? (
                    <img src={theme.schoolIcon} alt=""
                        style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '8px' }} />
                ) : (
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '1rem',
                    }}>
                        {theme.schoolName.charAt(0)}
                    </div>
                )}
                {!collapsed && (
                    <div>
                        <div style={{
                            fontWeight: 700, fontSize: '0.9375rem',
                            color: 'var(--sidebar-text-active)',
                            whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis', maxWidth: '170px',
                            lineHeight: 1.2,
                        }}>
                            {theme.schoolName}
                        </div>
                        {theme.schoolTagline && (
                            <div style={{
                                fontSize: '0.6875rem',
                                color: 'var(--sidebar-text)',
                                opacity: 0.7,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '170px',
                            }}>
                                {theme.schoolTagline}
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile close button */}
                <button
                    onClick={onMobileClose}
                    className="mobile-only"
                    style={{
                        marginLeft: 'auto', background: 'transparent', border: 'none',
                        color: 'var(--sidebar-text)', cursor: 'pointer', padding: '4px',
                        display: 'none',
                    }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Nav items */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
                {!collapsed && (
                    <div style={{
                        padding: '10px 16px 4px',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: 'var(--sidebar-text)',
                        opacity: 0.5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>MENU</div>
                )}
                {NAV_ITEMS.map(item => (
                    <SidebarItem key={item.id} item={item} collapsed={collapsed} />
                ))}
            </div>
        </nav>
    );
}
