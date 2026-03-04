// src/store/themeStore.ts — School white-label theme store

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SchoolTheme {
    // Identity
    schoolName: string;
    schoolTagline: string;
    schoolLogo: string | null;   // URL or null
    schoolIcon: string | null;   // favicon URL or null

    // Brand colours (hex)
    primaryColor: string;
    primaryDark: string;
    primaryLight: string;
    accentColor: string;

    // UI preferences
    sidebarDark: boolean;         // true = dark sidebar, false = light sidebar
    borderRadius: string;         // e.g. '8px', '4px', '16px'
    fontFamily: string;           // e.g. 'Inter', 'Poppins'
}

interface ThemeState {
    theme: SchoolTheme;
    setTheme: (partial: Partial<SchoolTheme>) => void;
    applyTheme: () => void;
    resetToDefault: () => void;
}

export const DEFAULT_THEME: SchoolTheme = {
    schoolName: 'SchoolOS',
    schoolTagline: 'School Management System',
    schoolLogo: null,
    schoolIcon: null,
    primaryColor: '#0D9488',
    primaryDark: '#0F766E',
    primaryLight: '#14B8A6',
    accentColor: '#6366F1',
    sidebarDark: true,
    borderRadius: '8px',
    fontFamily: 'Inter',
};

function hexToRgb(hex: string) {
    const m = hex.replace('#', '').match(/.{2}/g);
    if (!m) return '0,0,0';
    return m.map(x => parseInt(x, 16)).join(',');
}

function applyThemeToDom(theme: SchoolTheme) {
    if (typeof document === 'undefined') return;
    const r = document.documentElement;

    r.style.setProperty('--color-brand', theme.primaryColor);
    r.style.setProperty('--color-brand-dark', theme.primaryDark);
    r.style.setProperty('--color-brand-light', theme.primaryLight);
    r.style.setProperty('--color-accent', theme.accentColor);
    r.style.setProperty('--color-brand-rgb', hexToRgb(theme.primaryColor));

    // Sidebar background
    if (theme.sidebarDark) {
        r.style.setProperty('--sidebar-bg', '#1E293B');
        r.style.setProperty('--sidebar-border', '#334155');
        r.style.setProperty('--sidebar-text', '#94A3B8');
        r.style.setProperty('--sidebar-text-active', '#F1F5F9');
        r.style.setProperty('--sidebar-item-active-bg', `rgba(${hexToRgb(theme.primaryColor)}, 0.15)`);
    } else {
        r.style.setProperty('--sidebar-bg', '#FFFFFF');
        r.style.setProperty('--sidebar-border', '#E2E8F0');
        r.style.setProperty('--sidebar-text', '#64748B');
        r.style.setProperty('--sidebar-text-active', '#0F172A');
        r.style.setProperty('--sidebar-item-active-bg', `rgba(${hexToRgb(theme.primaryColor)}, 0.10)`);
    }

    r.style.setProperty('--border-radius', theme.borderRadius);
    r.style.setProperty('--font-sans', `'${theme.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`);

    // Update favicon if provided
    if (theme.schoolIcon) {
        const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
        if (link) link.href = theme.schoolIcon;
    }
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: DEFAULT_THEME,

            setTheme: (partial) => {
                const updated = { ...get().theme, ...partial };
                set({ theme: updated });
                applyThemeToDom(updated);
            },

            applyTheme: () => {
                applyThemeToDom(get().theme);
            },

            resetToDefault: () => {
                set({ theme: DEFAULT_THEME });
                applyThemeToDom(DEFAULT_THEME);
            },
        }),
        {
            name: 'schoolos-theme',
        },
    ),
);
