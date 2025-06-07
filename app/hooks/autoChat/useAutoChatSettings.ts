import { useCallback } from 'react';
import { useSettingsStore } from '@/features/stores/settings';

export function useAutoChatSettings() {
  const { settings, setSettings } = useSettingsStore();

  const updateSettings = useCallback(
    (newSettings: {
      isEnabled?: boolean;
      silenceThreshold?: number;
      theme?: string;
    }) => {
      setSettings((prev) => ({
        ...prev,
        autoChat: {
          ...prev.autoChat,
          ...newSettings,
        },
      }));
    },
    [setSettings]
  );

  return {
    isEnabled: settings.autoChat?.isEnabled ?? false,
    silenceThreshold: settings.autoChat?.silenceThreshold ?? 20000,
    theme: settings.autoChat?.theme ?? '',
    updateSettings,
  };
} 