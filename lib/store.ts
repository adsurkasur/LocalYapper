import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  displayName: string;
  avatarPath?: string;
  locale: string;
  timezone: string;
  theme: string;
  defaultBotId?: string;
  defaultModel?: string;
  security?: string;
}

interface Persona {
  id: string;
  userId: string;
  name: string;
  style: string;
  speakingPatterns: string;
  preferences: string;
  tags: string[];
}

interface Bot {
  id: string;
  userId: string;
  name: string;
  color: string;
  avatarPath?: string;
  systemPrompt: string;
  defaultModel: string;
  temperature: number;
  topP: number;
  visibility: string;
}

interface AppState {
  // Current user
  user: User | null;
  setUser: (user: User | null) => void;

  // Active persona
  activePersona: Persona | null;
  setActivePersona: (persona: Persona | null) => void;

  // Available personas
  personas: Persona[];
  setPersonas: (personas: Persona[]) => void;

  // Available bots
  bots: Bot[];
  setBots: (bots: Bot[]) => void;

  // Settings
  settings: {
    ollamaHost: string;
    internetEnabled: boolean;
  };
  setSettings: (settings: Partial<AppState['settings']>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      activePersona: null,
      setActivePersona: (persona) => set({ activePersona: persona }),

      personas: [],
      setPersonas: (personas) => set({ personas }),

      bots: [],
      setBots: (bots) => set({ bots }),

      settings: {
        ollamaHost: 'http://127.0.0.1:11434',
        internetEnabled: false,
      },
      setSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
    }),
    {
      name: 'localyapper-store',
      partialize: (state) => ({
        user: state.user,
        activePersona: state.activePersona,
        settings: state.settings,
      }),
    }
  )
);