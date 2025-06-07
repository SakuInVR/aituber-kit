import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

// リクエストのバリデーションスキーマ
const requestSchema = z.object({
  theme: z.string(),
  model: z.enum(['gemini', 'openai']).default('gemini'),
})

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// プロンプト生成関数
function generatePrompt(theme: string): string {
  return `あなたは配信者として、以下のテーマについて自然な会話を生成してください。
テーマ: ${theme}

- 配信者としての自然な口調で
- 30文字程度の短い文章で
- 絵文字は使用しない
- 改行は1回まで
- 句読点は適度に使用
- 話し言葉で自然な表現を使用`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { theme, model } = requestSchema.parse(body)

    console.log('APIルート呼び出し確認')
    console.log('GEMINI_API_KEY:', !!process.env.GEMINI_API_KEY)
    console.log('theme:', theme)

    if (model === 'gemini') {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const prompt = generatePrompt(theme)
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('Gemini APIレスポンス:', JSON.stringify(result, null, 2))
      
      return NextResponse.json({ message: text })
    } else {
      // OpenAIの実装は後ほど追加
      return NextResponse.json(
        { error: 'OpenAI model is not implemented yet' },
        { status: 501 }
      )
    }
  } catch (error) {
    console.error('Error in auto-chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
