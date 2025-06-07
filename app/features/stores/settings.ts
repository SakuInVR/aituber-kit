import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings } from '@/types/settings';

const defaultSettings: Settings = {
  autoChat: {
    isEnabled: false,
    silenceThreshold: 20000,
    theme: '',
  },
};

export const useSettingsStore = create<{
  settings: Settings;
  setSettings: (updater: (prev: Settings) => Settings) => void;
}>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (updater) =>
        set((state) => ({ settings: updater(state.settings) })),
    }),
    {
      name: 'settings-storage',
    }
  )
); 