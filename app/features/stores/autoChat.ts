import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AutoChatState {
  isEnabled: boolean
  silenceThreshold: number
  currentTheme: string
  setEnabled: (enabled: boolean) => void
  setSilenceThreshold: (threshold: number) => void
  setCurrentTheme: (theme: string) => void
}

export const useAutoChatStore = create<AutoChatState>()(
  persist(
    (set) => ({
      isEnabled: false,
      silenceThreshold: 20000, // デフォルト20秒
      currentTheme: '',
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      setSilenceThreshold: (threshold) => set({ silenceThreshold: threshold }),
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
    }),
    {
      name: 'auto-chat-storage',
    }
  )
)
