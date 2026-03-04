// src/store/authStore.ts — Zustand global auth state

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    hydrated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setAccessToken: (token: string) => void;
    clearAuth: () => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            hydrated: false,

            setHydrated: () => set({ hydrated: true }),

            setAuth: (user, accessToken, refreshToken) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', accessToken);
                    localStorage.setItem('refresh_token', refreshToken);
                }
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            setAccessToken: (token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', token);
                }
                set({ accessToken: token });
            },

            clearAuth: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
                }
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },
        }),
        {
            name: 'schoolos-auth',
            // Persist user, auth state, AND refresh token
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                refreshToken: state.refreshToken,
            }),
            onRehydrateStorage: () => (state) => {
                // Restore tokens from localStorage into Zustand memory
                if (state && typeof window !== 'undefined') {
                    const at = localStorage.getItem('access_token');
                    if (at) state.accessToken = at;
                    // Signal hydration is complete
                    state.hydrated = true;
                }
            },
        },
    ),
);
