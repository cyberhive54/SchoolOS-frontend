'use client';

import React from 'react';
import { Menu, Search, Maximize, Calendar, CheckSquare, MessageCircle, Phone, Globe, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export function Header({ sidebarCollapsed, toggleSidebar }: HeaderProps) {
    const { user } = useAuthStore();

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <header style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
        }}>
            {/* Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-primary)'
                    }}
                >
                    <Menu size={20} />
                </button>
                <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-text-primary)' }}>
                    Mount Carmel School
                </div>
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="Search By Student Name..."
                        style={{
                            padding: '8px 16px 8px 36px',
                            borderRadius: '999px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.875rem',
                            outline: 'none',
                            width: '240px',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                </div>

                {/* Currency */}
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    USD
                </div>

                {/* Language (Mock flag with globe) */}
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Globe size={18} color="var(--color-text-secondary)" />
                </button>

                {/* Fullscreen toggle */}
                <button onClick={handleFullscreen} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Maximize size={18} color="var(--color-text-secondary)" />
                </button>

                {/* Calendar */}
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Calendar size={18} color="var(--color-text-secondary)" />
                </button>

                {/* Tasks */}
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <CheckSquare size={18} color="var(--color-text-secondary)" />
                </button>

                {/* Chat Notification */}
                <button style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <MessageCircle size={18} color="var(--color-text-secondary)" />
                    <span style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        backgroundColor: '#ef4444', color: 'white',
                        fontSize: '10px', fontWeight: 'bold',
                        padding: '2px 5px', borderRadius: '10px',
                        lineHeight: 1
                    }}>0</span>
                </button>

                {/* WhatsApp */}
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                    <Phone size={18} color="#25D366" />
                </button>

                {/* Profile Avatar */}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: 'var(--color-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: '0.875rem',
                    cursor: 'pointer'
                }}>
                    {user?.first_name?.[0]?.toUpperCase() || 'A'}
                </div>
            </div>
        </header>
    );
}
