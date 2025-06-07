import { POST } from '../route'
import { Anthropic } from '@anthropic-ai/sdk'

// Anthropicのモック
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: 'テストメッセージ' }],
      }),
    },
  })),
}))

describe('自動会話APIエンドポイントのテスト', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('正常なリクエストで会話を生成できること', async () => {
    const request = new Request('http://localhost:3000/api/auto-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: 'ゲーム配信',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('テストメッセージ')
    expect(Anthropic).toHaveBeenCalled()
  })

  it('テーマが空の場合にエラーを返すこと', async () => {
    const request = new Request('http://localhost:3000/api/auto-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: '',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('自動会話の生成に失敗しました')
  })

  it('APIキーが設定されていない場合にエラーを返すこと', async () => {
    // 環境変数を一時的に削除
    const originalApiKey = process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_API_KEY

    const request = new Request('http://localhost:3000/api/auto-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: 'ゲーム配信',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('自動会話の生成に失敗しました')

    // 環境変数を復元
    process.env.ANTHROPIC_API_KEY = originalApiKey
  })
})
