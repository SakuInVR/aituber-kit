import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  handleAutoChatError,
  validateTheme,
  validateSilenceThreshold,
} from '@/utils/errorHandling'

export type AutoChatProvider = 'gemini' | 'openai'
export type AutoChatMode = 'once' | 'repeat'

interface AutoChatState {
  isEnabled: boolean
  silenceThreshold: number
  currentTheme: string
  provider: AutoChatProvider
  mode: AutoChatMode
  setEnabled: (enabled: boolean) => void
  setSilenceThreshold: (threshold: number) => void
  setCurrentTheme: (theme: string) => void
  setProvider: (provider: AutoChatProvider) => void
  setMode: (mode: AutoChatMode) => void
}

export const useAutoChatStore = create<AutoChatState>()(
  persist(
    (set) => ({
      isEnabled: false,
      silenceThreshold: 15000, // デフォルト15秒
      currentTheme: '',
      provider: 'gemini', // デフォルトはGemini
      mode: 'repeat', // デフォルトは繰り返し
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
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'auto-chat-storage',
    }
  )
)

// 他タブでのlocalStorage変更を監視してストアを再同期
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auto-chat-storage') {
      try {
        const newState = JSON.parse(event.newValue || '{}')
        if (newState && newState.state) {
          useAutoChatStore.setState(newState.state)
        }
      } catch (e) {
        console.warn('autoChatストア同期エラー:', e)
      }
    }
  })
}
