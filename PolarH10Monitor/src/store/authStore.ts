/**
 * authStore.ts — Zustand store for authentication state.
 *
 * Replaces the old React Context + useState pattern.
 * Persistence is handled by secureStorage (EncryptedStorage + AES-256).
 */

import { create } from 'zustand';
import { secureRead, secureRemove, secureWrite } from '../utils/secureStorage';

const STORAGE_KEY = 'app-user';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Single uppercase initial used as the avatar bubble label */
  avatar: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /**
   * Call once on app boot (from AuthProvider) to rehydrate the stored
   * session into the Zustand store.
   */
  initialize: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const user = await secureRead<User>(STORAGE_KEY);
      set({ user, isAuthenticated: !!user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email: string, _password: string) => {
    // TODO: replace with a real auth API call
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    const user: User = {
      id: '1',
      name: 'Alex Johnson',
      email,
      avatar: email.charAt(0).toUpperCase(),
    };
    // Persist best-effort — storage failure should not abort login.
    secureWrite<User>(STORAGE_KEY, user).catch(e =>
      console.warn('[authStore] login persist failed:', e),
    );
    set({ user, isAuthenticated: true });
  },

  signup: async (name: string, email: string, _password: string) => {
    // TODO: replace with a real auth API call
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));
    const user: User = {
      id: '1',
      name,
      email,
      avatar: name.charAt(0).toUpperCase(),
    };
    // Persist best-effort — storage failure should not abort signup.
    secureWrite<User>(STORAGE_KEY, user).catch(e =>
      console.warn('[authStore] signup persist failed:', e),
    );
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await secureRemove(STORAGE_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
