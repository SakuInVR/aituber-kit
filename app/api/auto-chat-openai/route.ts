export async function POST(request: Request) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY is not set' }),
      { status: 500 }
    )
  }

  try {
    const { theme } = await request.json()
    if (!theme || typeof theme !== 'string' || theme.trim() === '') {
      return new Response(JSON.stringify({ error: 'テーマが未入力です' }), {
        status: 400,
      })
    }

    const prompt = `あなたは配信者の相棒AIです。現在の配信テーマは「${theme}」です。このテーマに沿って、視聴者が楽しめるような自然な会話文を1～2文で生成してください。`

    const openaiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'あなたは配信者の相棒AIです。' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    })

    if (!openaiRes.ok) {
      const errorBody = await openaiRes.text()
      return new Response(
        JSON.stringify({ error: 'OpenAI APIエラー', details: errorBody }),
        { status: 500 }
      )
    }

    const data = await openaiRes.json()
    const message = data?.choices?.[0]?.message?.content
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'OpenAIから会話文が取得できませんでした' }),
        { status: 500 }
      )
    }

    return new Response(JSON.stringify({ message }), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'サーバーエラー',
        details: error instanceof Error ? error.message : error,
      }),
      { status: 500 }
    )
  }
}
