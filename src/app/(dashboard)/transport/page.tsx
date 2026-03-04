'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Bus, Wrench } from 'lucide-react';

export default function TransportPage() {
    return (
        <>
            <Header title="Transport" subtitle="Manage vehicles, routes and student commute" />
            <div style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', background: 'var(--color-bg-elevated)', marginBottom: '16px' }}>
                        <Bus size={48} color="var(--color-brand)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Coming Soon (Phase 2)</h2>
                    <p style={{ maxWidth: '400px', margin: '8px auto 0' }}>The Transport module handles routing, vehicle tracking, and driver assignments. It will be implemented in Phase 2.</p>
                </div>
            </div>
        </>
    );
}
