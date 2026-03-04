'use client';

import React from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            {/* Main content shifts with sidebar via CSS class */}
            <div id="main-content" className="main-content" style={{ background: 'var(--color-bg-base)' }}>
                {/* Inline header built into layout for simplicity */}
                <div style={{
                    height: '64px',
                    background: 'var(--color-bg-surface)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 28px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                }}>
                    <div style={{ flex: 1 }}>
                        {title && (
                            <>
                                <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h1>
                                {subtitle && <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
                            </>
                        )}
                    </div>
                </div>

                <main style={{ flex: 1, padding: '0' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
