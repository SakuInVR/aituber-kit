import { renderHook, act } from '@testing-library/react'
import { useAutoChat } from '../useAutoChat'
import { useAutoChatStore } from '@/app/features/stores/autoChat'

describe('useAutoChatフックのテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAutoChatStore.setState({
      isEnabled: false,
      silenceThreshold: 15000,
      currentTheme: '',
    })
  })

  it('初期状態が正しく設定されていること', () => {
    const { result } = renderHook(() => useAutoChat())

    expect(result.current.isEnabled).toBe(false)
    expect(result.current.silenceThreshold).toBe(15000)
    expect(result.current.currentTheme).toBe('')
  })

  it('自動会話が有効な場合に会話を生成すること', async () => {
    // fetchのモック実装
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'テストメッセージ' }),
    })

    useAutoChatStore.setState({
      isEnabled: true,
      silenceThreshold: 100, // テスト用に短い時間に設定
      currentTheme: 'ゲーム配信',
    })

    const { result } = renderHook(() => useAutoChat())

    // タイマーを待機
    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/auto-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: 'ゲーム配信',
      }),
    })
  })

  it('自動会話が無効な場合は会話を生成しないこと', async () => {
    useAutoChatStore.setState({
      isEnabled: false,
      silenceThreshold: 100,
      currentTheme: 'ゲーム配信',
    })

    const { result } = renderHook(() => useAutoChat())

    // タイマーを待機
    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('APIエラー時にエラーハンドリングが動作すること', async () => {
    // fetchのモック実装（エラーケース）
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('APIエラー'))

    useAutoChatStore.setState({
      isEnabled: true,
      silenceThreshold: 100,
      currentTheme: 'ゲーム配信',
    })

    const { result } = renderHook(() => useAutoChat())

    // タイマーを待機
    await act(async () => {
      jest.advanceTimersByTime(200)
    })

    expect(global.fetch).toHaveBeenCalled()
    // エラーが発生してもアプリケーションがクラッシュしないことを確認
    expect(result.current).toBeDefined()
  })
})
