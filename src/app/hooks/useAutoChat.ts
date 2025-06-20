import { useEffect, useCallback, useState } from 'react'
import { useAutoChatStore } from '@/app/features/stores/autoChat'
import { handleAutoChatError } from '@/utils/errorHandling'
import homeStore from '@/features/stores/home'
import { Message, MessageContent } from '@/features/messages/messages'
import { toast } from 'react-toastify'
import { speakCharacter } from '@/features/messages/speakCharacter'

export const useAutoChat = () => {
  const { isEnabled, silenceThreshold, currentTheme, provider, setEnabled, mode } =
    useAutoChatStore()
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAutoChat = useCallback(async () => {
    if (!isEnabled || !currentTheme) {
      toast.warning('自動会話を有効にするか、配信テーマを設定してください。')
      return false
    }

    if (isGenerating) {
      console.log('自動会話生成中です...')
      return false
    }

    try {
      setIsGenerating(true)
      const endpoint =
        provider === 'openai'
          ? '/api/auto-chat-openai'
          : '/api/auto-chat-gemini'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: currentTheme,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `自動会話の生成に失敗しました (${response.status})`
        )
      }

      const data = await response.json()
      if (data.message) {
        const messageContent: MessageContent = {
          type: 'text',
          text: data.message,
        }

        const newMessage: Message = {
          role: 'assistant',
          content: [messageContent],
          isAutoGenerated: true,
          timestamp: new Date().toISOString(),
        }

        // メッセージを追加
        homeStore.setState((state) => ({
          chatLog: [...state.chatLog, newMessage],
        }))

        // ここでTTSをトリガー
        speakCharacter(
          'auto-chat', // sessionId（任意の文字列でOK）
          { message: data.message, emotion: 'neutral' }
        )

        toast.success('自動会話を生成しました')

        // 一回限りモードならOFFにする
        if (mode === 'once') {
          setEnabled(false)
        }

        return true
      }
      throw new Error('自動会話の生成に失敗しました')
    } catch (error) {
      handleAutoChatError(error)
      toast.error(
        error instanceof Error ? error.message : '自動会話の生成に失敗しました'
      )
      return false
    } finally {
      setIsGenerating(false)
    }
  }, [isEnabled, currentTheme, isGenerating, provider, setEnabled, mode])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isEnabled) {
      setRemainingTime(silenceThreshold);
      let lastTriggered = Date.now();

      intervalId = setInterval(async () => {
        // 最新のisEnabledを毎回チェック
        if (!useAutoChatStore.getState().isEnabled) return;
        const elapsed = Date.now() - lastTriggered;
        setRemainingTime(Math.max(0, silenceThreshold - elapsed));
        if (elapsed >= silenceThreshold) {
          lastTriggered = Date.now();
          const success = await generateAutoChat();
          if (!success) {
            console.error('自動会話の生成に失敗しました');
          }
          setRemainingTime(silenceThreshold);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isEnabled, silenceThreshold, currentTheme, provider, generateAutoChat]);

  return {
    isEnabled,
    silenceThreshold,
    currentTheme,
    generateAutoChat,
    remainingTime,
    isGenerating,
  }
}
