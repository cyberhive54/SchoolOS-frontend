'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/store/themeStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
        mutations: { retry: 0 },
    },
});

function ThemeInitializer() {
    const { applyTheme } = useThemeStore();
    useEffect(() => {
        // Apply saved school theme (CSS vars) immediately on first load
        applyTheme();
    }, [applyTheme]);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeInitializer />
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--color-bg-elevated)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                    },
                    success: {
                        iconTheme: { primary: 'var(--color-brand)', secondary: 'white' },
                    },
                    error: {
                        iconTheme: { primary: 'var(--color-danger)', secondary: 'white' },
                    },
                }}
            />
        </QueryClientProvider>
    );
}
