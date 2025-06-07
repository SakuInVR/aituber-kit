import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  handleAutoChatError,
  validateTheme,
  validateSilenceThreshold,
} from '@/utils/errorHandling'

export type AutoChatProvider = 'gemini' | 'openai'

interface AutoChatState {
  isEnabled: boolean
  silenceThreshold: number
  currentTheme: string
  provider: AutoChatProvider
  setEnabled: (enabled: boolean) => void
  setSilenceThreshold: (threshold: number) => void
  setCurrentTheme: (theme: string) => void
  setProvider: (provider: AutoChatProvider) => void
}

export const useAutoChatStore = create<AutoChatState>()(
  persist(
    (set) => ({
      isEnabled: false,
      silenceThreshold: 15000, // デフォルト15秒
      currentTheme: '',
      provider: 'gemini', // デフォルトはGemini
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      setSilenceThreshold: (threshold) => {
        try {
          validateSilenceThreshold(threshold)
          set({ silenceThreshold: threshold })
        } catch (error) {
          handleAutoChatError(error)
        }
      },
      setCurrentTheme: (theme) => {
        try {
          validateTheme(theme)
          set({ currentTheme: theme })
        } catch (error) {
          handleAutoChatError(error)
        }
      },
      setProvider: (provider) => set({ provider }),
    }),
    {
      name: 'auto-chat-storage',
    }
  )
)
