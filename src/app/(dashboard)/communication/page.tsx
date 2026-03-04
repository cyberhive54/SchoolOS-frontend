'use client';

import React from 'react';

import { MessageSquare } from 'lucide-react';

export default function CommunicationPage() {
    return (
        <>

            <div style={{ padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', background: 'var(--color-bg-elevated)', marginBottom: '16px' }}>
                        <MessageSquare size={48} color="var(--color-brand)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>Coming Soon (Phase 3)</h2>
                    <p style={{ maxWidth: '400px', margin: '8px auto 0' }}>The Communication module handles unified notifications, event alerts, and templates. It will be implemented in Phase 3.</p>
                </div>
            </div>
        </>
    );
}
