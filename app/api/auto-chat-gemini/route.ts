import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const DEFAULT_MODEL = 'gemini-2.0-flash';

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set' },
      { status: 500 }
    );
  }

  try {
    const { theme, model } = await req.json();
    const modelName = model || DEFAULT_MODEL;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`;

    console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? '設定されています' : '未設定');
    console.log('リクエストのテーマ:', theme);
    console.log('使用モデル:', modelName);

    if (!theme || typeof theme !== 'string' || theme.trim() === '') {
      console.error('テーマが未入力です');
      return NextResponse.json(
        { error: 'テーマが未入力です' },
        { status: 400 }
      );
    }

    const prompt = `あなたは配信者の相棒AIです。現在の配信テーマは「${theme}」です。このテーマに沿って、視聴者が楽しめるような自然な会話文を1～2文で生成してください。`;
    console.log('Gemini APIに送信するプロンプト:', prompt);

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text();
      console.error('Gemini APIエラー:', errorBody);
      return NextResponse.json(
        { error: 'Gemini APIエラー', details: errorBody },
        { status: 500 }
      );
    }

    const data = await geminiRes.json();
    console.log('Gemini APIレスポンス:', data);

    const parts = data?.candidates?.[0]?.content?.parts;
    let message = '';
    if (Array.isArray(parts)) {
      message = parts
        .map((p: any) => (typeof p.text === 'string' ? p.text : ''))
        .filter(Boolean)
        .join('\n');
    }
    if (!message) {
      message = '[テキストが取得できませんでした]';
    }
    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    console.error('サーバーエラー:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラー',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 