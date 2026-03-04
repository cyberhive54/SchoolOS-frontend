'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <>
            <Header title="Settings" subtitle="Global configuration and preferences" />
            <div style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', background: 'var(--color-bg-elevated)', marginBottom: '16px' }}>
                        <Settings size={48} color="var(--color-brand)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Under Construction</h2>
                    <p style={{ maxWidth: '400px', margin: '8px auto 0' }}>Global settings including payment gateways, SMS providers, UI themes, and roles are managed here.</p>
                </div>
            </div>
        </>
    );
}
