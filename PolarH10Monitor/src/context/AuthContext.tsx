/**
 * AuthContext.tsx
 *
 * Public API is unchanged — all consumers (ProfileModal, FigmaHomeScreen, etc.)
 * continue to import { useAuth, AuthProvider } from here without modification.
 *
 * Internally the implementation has moved to:
 *   src/store/authStore.ts     — Zustand store
 *   src/utils/secureStorage.ts — EncryptedStorage (OS secure enclave) + AES-256
 */

import React, { useEffect, ReactNode } from 'react';
import { useAuthStore, User } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';

export type { User };

/**
 * Drop-in replacement for the old Context Provider.
 * With Zustand there is no wrapping context needed; this component solely
 * triggers the one-time rehydration of persisted auth state on app boot.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

/**
 * Convenience hook — mirrors the old Context shape exactly so call sites
 * require no changes.
 */
export function useAuth() {
  return useAuthStore(
    useShallow(s => ({
      user: s.user,
      isAuthenticated: s.isAuthenticated,
      isLoading: s.isLoading,
      login: s.login,
      signup: s.signup,
      logout: s.logout,
    })),
  );
}
