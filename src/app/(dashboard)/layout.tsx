'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, hydrated } = useAuthStore();
    const { applyTheme } = useThemeStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Apply saved theme on mount
    useEffect(() => {
        applyTheme();
    }, [applyTheme]);

    // Wait until Zustand has rehydrated from localStorage before checking auth
    useEffect(() => {
        if (hydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [hydrated, isAuthenticated, router]);

    // Close mobile sidebar on resize to desktop
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Still hydrating — show spinner but DON'T redirect yet
    if (!hydrated) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-bg-base)', flexDirection: 'column', gap: '16px',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid var(--color-border)',
                    borderTopColor: 'var(--color-brand)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-base)', position: 'relative' }}>

            {/* Mobile overlay backdrop */}
            {mobileSidebarOpen && (
                <div
                    onClick={() => setMobileSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 39, backdropFilter: 'blur(2px)',
                    }}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileSidebarOpen}
                onToggleCollapse={() => setSidebarCollapsed(c => !c)}
                onMobileClose={() => setMobileSidebarOpen(false)}
            />

            {/* Main area */}
            <div
                className="main-content"
                style={{
                    marginLeft: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)',
                    transition: 'margin-left var(--sidebar-transition)',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    minHeight: '100vh',
                }}
            >
                <Header
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() => setSidebarCollapsed(c => !c)}
                    onMobileMenuOpen={() => setMobileSidebarOpen(true)}
                />
                <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
