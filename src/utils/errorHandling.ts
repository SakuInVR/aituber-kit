import { toast } from 'react-toastify'

export class AutoChatError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AutoChatError'
  }
}

export const handleAutoChatError = (error: unknown) => {
  if (error instanceof AutoChatError) {
    switch (error.code) {
      case 'API_ERROR':
        toast.error(
          '自動会話の生成に失敗しました。APIの応答を確認してください。'
        )
        break
      case 'SILENCE_DETECTION_ERROR':
        toast.error('沈黙検知に問題が発生しました。設定を確認してください。')
        break
      case 'THEME_VALIDATION_ERROR':
        toast.error('配信テーマの設定に問題があります。')
        break
      default:
        toast.error(error.message)
    }
    console.error('AutoChat Error:', error)
  } else if (error instanceof Error) {
    toast.error('予期せぬエラーが発生しました。')
    console.error('Unexpected Error:', error)
  } else {
    toast.error('不明なエラーが発生しました。')
    console.error('Unknown Error:', error)
  }
}

export const validateTheme = (theme: string): boolean => {
  if (theme.length > 100) {
    throw new AutoChatError(
      '配信テーマは100文字以内で入力してください。',
      'THEME_VALIDATION_ERROR'
    )
  }
  return true
}

export const validateSilenceThreshold = (threshold: number): boolean => {
  if (threshold < 5000 || threshold > 60000) {
    throw new AutoChatError(
      '沈黙検知の閾値は5秒から60秒の間で設定してください。',
      'SILENCE_DETECTION_ERROR'
    )
  }
  return true
}
