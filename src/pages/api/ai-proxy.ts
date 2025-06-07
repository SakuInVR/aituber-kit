import type { NextApiRequest, NextApiResponse } from 'next'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'OpenAI APIキーが設定されていません' })
    return
  }

  const { messages, systemPrompt } = req.body
  if ((!messages || !Array.isArray(messages)) && !systemPrompt) {
    res.status(400).json({ error: 'Messages array is required' })
    return
  }

  try {
    const openaiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...(Array.isArray(messages)
        ? messages.map((m: string) => ({ role: 'user', content: m }))
        : []),
    ]
    if (openaiMessages.length === 0) {
      res.status(400).json({ error: 'systemPromptまたはmessagesが必要です' })
      return
    }
    const openaiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 256,
        temperature: 0.8,
      }),
    })
    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      res.status(500).json({ error: 'OpenAI APIエラー', detail: err })
      return
    }
    const data = await openaiRes.json()
    const aiMessage = data.choices?.[0]?.message?.content || ''
    res.status(200).json({ aiMessage })
  } catch (e: any) {
    res
      .status(500)
      .json({ error: 'OpenAI APIリクエスト失敗', detail: e.message })
  }
}
