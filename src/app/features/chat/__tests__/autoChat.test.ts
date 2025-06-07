import { useAutoChatStore } from '@/app/features/stores/autoChat'
import {
  handleAutoChatError,
  validateTheme,
  validateSilenceThreshold,
} from '@/utils/errorHandling'

describe('自動会話機能のテスト', () => {
  beforeEach(() => {
    // ストアの状態をリセット
    useAutoChatStore.setState({
      isEnabled: false,
      silenceThreshold: 15000,
      currentTheme: '',
    })
  })

  describe('ストアのテスト', () => {
    it('初期状態が正しく設定されていること', () => {
      const state = useAutoChatStore.getState()
      expect(state.isEnabled).toBe(false)
      expect(state.silenceThreshold).toBe(15000)
      expect(state.currentTheme).toBe('')
    })

    it('設定を更新できること', () => {
      useAutoChatStore.getState().setEnabled(true)
      useAutoChatStore.getState().setSilenceThreshold(20000)
      useAutoChatStore.getState().setCurrentTheme('ゲーム配信')

      const state = useAutoChatStore.getState()
      expect(state.isEnabled).toBe(true)
      expect(state.silenceThreshold).toBe(20000)
      expect(state.currentTheme).toBe('ゲーム配信')
    })

    it('複数回設定を変更しても正しく反映されること', () => {
      useAutoChatStore.getState().setEnabled(true)
      useAutoChatStore.getState().setEnabled(false)
      expect(useAutoChatStore.getState().isEnabled).toBe(false)
      useAutoChatStore.getState().setSilenceThreshold(5000)
      useAutoChatStore.getState().setSilenceThreshold(60000)
      expect(useAutoChatStore.getState().silenceThreshold).toBe(60000)
      useAutoChatStore.getState().setCurrentTheme('A')
      useAutoChatStore.getState().setCurrentTheme('B')
      expect(useAutoChatStore.getState().currentTheme).toBe('B')
    })
  })

  describe('バリデーションのテスト', () => {
    it('テーマのバリデーションが正しく動作すること', () => {
      // 正常系
      expect(() => validateTheme('ゲーム配信')).not.toThrow()
      expect(() => validateTheme('雑談配信')).not.toThrow()

      // 異常系
      expect(() => validateTheme('')).toThrow('テーマを入力してください')
      expect(() => validateTheme('a'.repeat(100))).not.toThrow()
      expect(() => validateTheme('a'.repeat(101))).toThrow(
        'テーマは100文字以内で入力してください'
      )
    })

    it('沈黙閾値のバリデーションが正しく動作すること', () => {
      // 正常系
      expect(() => validateSilenceThreshold(5000)).not.toThrow()
      expect(() => validateSilenceThreshold(60000)).not.toThrow()

      // 異常系
      expect(() => validateSilenceThreshold(4999)).toThrow(
        '沈黙検知の閾値は5秒から60秒の間で設定してください。'
      )
      expect(() => validateSilenceThreshold(60001)).toThrow(
        '沈黙検知の閾値は5秒から60秒の間で設定してください。'
      )
    })

    it('異常値（NaN, null, undefined）でバリデーションが失敗すること', () => {
      expect(() => validateSilenceThreshold(NaN as any)).toThrow()
      expect(() => validateSilenceThreshold(null as any)).toThrow()
      expect(() => validateSilenceThreshold(undefined as any)).toThrow()
    })
  })

  describe('エラーハンドリングのテスト', () => {
    it('エラーハンドリングが正しく動作すること', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error')
      const mockError = new Error('テストエラー')

      handleAutoChatError(mockError)

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })
})
