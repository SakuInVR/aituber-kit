import React, { useState, useEffect } from 'react'
import settingsStore from '@/features/stores/settings'
import AutoChat from '../settings/autoChat'
import { useAutoChat } from '@/app/hooks/useAutoChat'
import { useAutoChatStore } from '@/app/features/stores/autoChat'
import homeStore from '@/features/stores/home'

interface Script {
  id: string
  name: string
  lines: string[]
}

const REACTIONS = ['こんにちは！', 'ありがとう！', '草', 'すごい！']

const DEFAULT_SCRIPTS: Script[] = [
  {
    id: 'opening',
    name: 'オープニング挨拶',
    lines: [
      'みなさん、こんにちは！',
      '本日の配信を始めます。',
      '最後まで楽しんでいってください！',
    ],
  },
  {
    id: 'self_intro',
    name: '自己紹介',
    lines: [
      '改めまして、私はAItuberのコックピットです。',
      'AIと一緒に楽しい配信をお届けします！',
    ],
  },
  {
    id: 'ending',
    name: '締めの挨拶',
    lines: [
      'そろそろ配信終了のお時間です。',
      '今日もご視聴ありがとうございました！',
      'また次回お会いしましょう！',
    ],
  },
]

const SCRIPTS_STORAGE_KEY = 'aituber-cockpit-scripts'

const COMMENTS = [
  '今日の配信も楽しみです！',
  'ゲーム上手すぎ！',
  '好きな食べ物は何ですか？',
]

const defaultClientId = process.env.NEXT_PUBLIC_CLIENT_ID || ''

const Cockpit: React.FC = () => {
  const { generateAutoChat, isGenerating } = useAutoChat()
  const [clientId, setClientId] = useState(defaultClientId)
  const [apiEndpoint, setApiEndpoint] = useState(
    'http://localhost:3000/api/messages'
  )
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // シナリオランチャー用（永続化）
  const [scripts, setScripts] = useState<Script[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SCRIPTS_STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    }
    return DEFAULT_SCRIPTS
  })
  const [selectedScriptId, setSelectedScriptId] = useState<string>(
    DEFAULT_SCRIPTS[0].id
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editScript, setEditScript] = useState<Script | null>(null)
  const [editName, setEditName] = useState('')
  const [editLines, setEditLines] = useState('')

  // 永続化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(scripts))
    }
  }, [scripts])

  // 編集開始
  const handleEdit = (script: Script | undefined) => {
    if (!script) return
    setIsEditing(true)
    setEditScript(script)
    setEditName(script.name)
    setEditLines(script.lines.join('\n'))
  }
  // 新規作成
  const handleAdd = () => {
    setIsEditing(true)
    setEditScript(null)
    setEditName('新しい台本')
    setEditLines('')
  }
  // 編集保存
  const handleSave = () => {
    const lines = editLines
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (!editName.trim() || lines.length === 0) return
    if (editScript) {
      setScripts(
        scripts.map((s) =>
          s.id === editScript.id ? { ...s, name: editName, lines } : s
        )
      )
      setSelectedScriptId(editScript.id)
    } else {
      const newId = 'script_' + Date.now()
      setScripts([...scripts, { id: newId, name: editName, lines }])
      setSelectedScriptId(newId)
    }
    setIsEditing(false)
    setEditScript(null)
    setEditName('')
    setEditLines('')
  }
  // 削除
  const handleDelete = (id: string) => {
    setScripts(scripts.filter((s) => s.id !== id))
    if (selectedScriptId === id && scripts.length > 1) {
      setSelectedScriptId(scripts[0].id)
    }
  }
  // 編集キャンセル
  const handleCancel = () => {
    setIsEditing(false)
    setEditScript(null)
    setEditName('')
    setEditLines('')
  }

  // コメントピッカー用
  const [selectedComment, setSelectedComment] = useState<string>('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [prompt, setPrompt] = useState('')

  // ゴッド・プロンプター用
  const [godPrompt, setGodPrompt] = useState('')

  // YouTube/会話継続モード（Zustandストアから取得）
  const youtubeMode = settingsStore((s) => s.youtubeMode)
  const conversationContinuityMode = settingsStore(
    (s) => s.conversationContinuityMode
  )

  // YouTubeコメント取得
  const [youtubeApiKey, setYoutubeApiKey] = useState(
    process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''
  )
  const [youtubeLiveId, setYoutubeLiveId] = useState(
    process.env.NEXT_PUBLIC_YOUTUBE_LIVE_ID || ''
  )
  const [ytComments, setYtComments] = useState<
    { id: string; author: string; message: string; publishedAt: string }[]
  >([])
  const [ytLoading, setYtLoading] = useState(false)

  useEffect(() => {
    if (!youtubeApiKey || !youtubeLiveId) return
    let timer: NodeJS.Timeout
    const fetchComments = async () => {
      setYtLoading(true)
      try {
        const res = await fetch(
          `/api/youtube-comments?apiKey=${encodeURIComponent(youtubeApiKey)}&liveId=${encodeURIComponent(youtubeLiveId)}`
        )
        const data = await res.json()
        if (data.comments) setYtComments(data.comments)
      } catch {}
      setYtLoading(false)
      timer = setTimeout(fetchComments, 5000)
    }
    fetchComments()
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [youtubeApiKey, youtubeLiveId])

  // ワンボタン・リアクション送信
  const sendReaction = async (text: string) => {
    if (!clientId || !apiEndpoint) {
      setResult('Client IDとAPIエンドポイントを入力してください')
      return
    }
    setSending(true)
    setResult(null)
    try {
      const url = `${apiEndpoint}?clientId=${encodeURIComponent(clientId)}&type=direct_send`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [text] }),
      })
      if (res.ok) {
        setResult('送信成功: ' + text)
      } else {
        setResult('送信失敗: ' + (await res.text()))
      }
    } catch (e: any) {
      setResult('送信エラー: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  // シナリオランチャー送信
  const sendScript = async () => {
    if (!clientId || !apiEndpoint) {
      setResult('Client IDとAPIエンドポイントを入力してください')
      return
    }
    setSending(true)
    setResult(null)
    const script = scripts.find((s) => s.id === selectedScriptId)
    if (!script) {
      setResult('台本が選択されていません')
      setSending(false)
      return
    }
    try {
      for (let i = 0; i < script.lines.length; i++) {
        const line = script.lines[i]
        const url = `${apiEndpoint}?clientId=${encodeURIComponent(clientId)}&type=direct_send`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [line] }),
        })
        if (!res.ok) {
          setResult(`台本送信失敗（${i + 1}行目）: ` + (await res.text()))
          setSending(false)
          return
        }
        // 文字数に応じて待機（1文字0.12秒＋1秒, 最低1.5秒）
        const waitMs = Math.max(1500, Math.floor(line.length * 120 + 1000))
        if (i < script.lines.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, waitMs))
        }
      }
      setResult('台本送信成功: ' + script.name)
    } catch (e: any) {
      setResult('台本送信エラー: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  // コメントピッカー送信（user_input）
  const sendUserInput = async () => {
    if (!clientId || !apiEndpoint) {
      setResult('Client IDとAPIエンドポイントを入力してください')
      return
    }
    if (!selectedComment) {
      setResult('コメントを選択してください')
      return
    }
    setSending(true)
    setResult(null)
    try {
      const url = `${apiEndpoint}?clientId=${encodeURIComponent(clientId)}&type=user_input`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [selectedComment] }),
      })
      if (res.ok) {
        setResult('コメント送信成功: ' + selectedComment)
      } else {
        setResult('コメント送信失敗: ' + (await res.text()))
      }
    } catch (e: any) {
      setResult('コメント送信エラー: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  // コメントピッカー送信（ai_generate→OpenAI→AItuberKit）
  const sendAIGenerate = async () => {
    if (!clientId || !apiEndpoint) {
      setResult('Client IDとAPIエンドポイントを入力してください')
      return
    }
    if (!selectedComment) {
      setResult('コメントを選択してください')
      return
    }
    setSending(true)
    setResult('AIに問い合わせ中...')
    try {
      // 1. OpenAIプロキシAPIへ問い合わせ
      const proxyRes = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [selectedComment],
          systemPrompt: prompt,
        }),
      })
      if (!proxyRes.ok) {
        setResult('AI生成送信失敗: ' + (await proxyRes.text()))
        setSending(false)
        setShowPrompt(false)
        setPrompt('')
        return
      }
      const proxyData = await proxyRes.json()
      const aiMessage = proxyData.aiMessage
      if (!aiMessage) {
        setResult('AIの返答が取得できませんでした')
        setSending(false)
        setShowPrompt(false)
        setPrompt('')
        return
      }
      setResult('AI返答取得: ' + aiMessage + ' → 発話中...')
      // 2. AItuberKit APIで発話
      const url = `${apiEndpoint}?clientId=${encodeURIComponent(clientId)}&type=direct_send`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [aiMessage] }),
      })
      if (res.ok) {
        setResult('AI生成送信成功: ' + aiMessage)
      } else {
        setResult('AItuberKit発話失敗: ' + (await res.text()))
      }
    } catch (e: any) {
      setResult('AI生成送信エラー: ' + e.message)
    } finally {
      setSending(false)
      setShowPrompt(false)
      setPrompt('')
    }
  }

  // ゴッド・プロンプター送信
  const sendGodPrompt = async () => {
    if (!clientId || !apiEndpoint) {
      setResult('Client IDとAPIエンドポイントを入力してください')
      return
    }
    if (!godPrompt.trim()) {
      setResult('指示文を入力してください')
      return
    }
    setSending(true)
    setResult(null)
    try {
      // OpenAIプロキシAPIへ systemPrompt として送信
      const proxyRes = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          systemPrompt: godPrompt,
        }),
      })
      if (!proxyRes.ok) {
        setResult('ゴッド・プロンプター送信失敗: ' + (await proxyRes.text()))
        setSending(false)
        return
      }
      const proxyData = await proxyRes.json()
      const aiMessage = proxyData.aiMessage
      if (!aiMessage) {
        setResult('AIの返答が取得できませんでした')
        setSending(false)
        return
      }
      setResult('AI返答取得: ' + aiMessage + ' → 発話中...')
      // 2. AItuberKit APIで発話
      const url = `${apiEndpoint}?clientId=${encodeURIComponent(clientId)}&type=direct_send`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [aiMessage] }),
      })
      if (res.ok) {
        setResult('ゴッド・プロンプター送信成功: ' + aiMessage)
        setGodPrompt('')
      } else {
        setResult('AItuberKit発話失敗: ' + (await res.text()))
      }
    } catch (e: any) {
      setResult('ゴッド・プロンプター送信エラー: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  const autoChatStore = useAutoChatStore()

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          AITuberコックピット
        </h1>
        {/* AutoChat（自動会話）設定セクション */}
        <section className="mb-8">
          <AutoChat />
          <div className="mt-4">
            <button
              className="bg-purple-500 text-white rounded px-4 py-2 hover:bg-purple-600"
              onClick={generateAutoChat}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '自動会話テスト'}
            </button>
          </div>
        </section>
        {/* モード切り替えスイッチ */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Client IDを入力"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              APIエンドポイント
            </label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="APIエンドポイントを入力"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center gap-2">
            <span className="font-semibold">YouTubeモード:</span>
            <button
              className={`px-3 py-1 rounded ${youtubeMode ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
              onClick={() =>
                settingsStore.setState({ youtubeMode: !youtubeMode })
              }
            >
              {youtubeMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="font-semibold">会話継続モード:</span>
            <button
              className={`px-3 py-1 rounded ${conversationContinuityMode ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
              onClick={() =>
                settingsStore.setState({
                  conversationContinuityMode: !conversationContinuityMode,
                })
              }
            >
              {conversationContinuityMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        {/* 各エリア */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ワンボタン・リアクション */}
          <section className="bg-blue-50 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">ワンボタン・リアクション</h2>
            <p className="text-sm text-gray-600 mb-2">
              よく使うセリフを即座に発話
            </p>
            <div className="grid grid-cols-2 gap-2">
              {REACTIONS.map((text) => (
                <button
                  key={text}
                  className="bg-blue-500 text-white rounded p-2 disabled:opacity-50"
                  onClick={() => sendReaction(text)}
                  disabled={sending}
                >
                  {text}
                </button>
              ))}
            </div>
            {result && (
              <div className="mt-4 text-sm text-center text-gray-700">
                {result}
              </div>
            )}
          </section>

          {/* シナリオランチャー */}
          <section className="bg-green-50 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">シナリオランチャー</h2>
            <p className="text-sm text-gray-600 mb-2">台本を選んで一括再生</p>
            <div className="flex gap-2 mb-2">
              <select
                className="w-full p-2 border rounded"
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                disabled={sending}
              >
                {scripts.map((script) => (
                  <option key={script.id} value={script.id}>
                    {script.name}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-500 text-white rounded px-3"
                onClick={handleAdd}
              >
                ＋
              </button>
              {scripts.length > 1 && (
                <button
                  className="bg-red-500 text-white rounded px-3"
                  onClick={() => handleDelete(selectedScriptId)}
                >
                  削除
                </button>
              )}
              <button
                className="bg-gray-500 text-white rounded px-3"
                onClick={() =>
                  handleEdit(scripts.find((s) => s.id === selectedScriptId))
                }
              >
                編集
              </button>
            </div>
            <ul className="mb-2 bg-white border rounded p-2">
              {scripts
                .find((s) => s.id === selectedScriptId)
                ?.lines.map((line, idx) => (
                  <li key={idx} className="mb-1 text-gray-800">
                    {line}
                  </li>
                ))}
            </ul>
            <button
              className="bg-green-500 text-white rounded p-2 disabled:opacity-50"
              onClick={sendScript}
              disabled={sending}
            >
              選択した台本を再生
            </button>
            {result && (
              <div className="mt-4 text-sm text-center text-gray-700">
                {result}
              </div>
            )}
            {isEditing && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <div className="mb-2 font-bold">
                  {editScript ? '台本を編集' : '新規台本を追加'}
                </div>
                <input
                  className="w-full p-2 border rounded mb-2"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="タイトル"
                />
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={4}
                  value={editLines}
                  onChange={(e) => setEditLines(e.target.value)}
                  placeholder="1行ごとにセリフを入力"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-gray-400 text-white rounded px-3"
                    onClick={handleCancel}
                  >
                    キャンセル
                  </button>
                  <button
                    className="bg-blue-500 text-white rounded px-3"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* コメントピッカー */}
          <section className="bg-yellow-50 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">
              インテリジェント・コメントピッカー
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              視聴者コメントを選んでAIに渡す
            </p>
            <div className="mb-2 flex gap-2">
              <input
                className="p-2 border rounded flex-1"
                type="text"
                placeholder="YouTube APIキー"
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
              />
              <input
                className="p-2 border rounded flex-1"
                type="text"
                placeholder="YouTubeライブID"
                value={youtubeLiveId}
                onChange={(e) => setYoutubeLiveId(e.target.value)}
              />
            </div>
            <div className="mb-2 text-xs text-gray-500">
              YouTubeコメント（最新20件）
            </div>
            <ul className="mb-2 max-h-40 overflow-y-auto bg-white border rounded p-2">
              {ytLoading && <li className="text-gray-400">取得中...</li>}
              {ytComments.map((c) => (
                <li
                  key={c.id}
                  className={`mb-1 p-2 rounded cursor-pointer ${selectedComment === c.message ? 'bg-yellow-200 font-bold' : 'bg-white hover:bg-yellow-100'}`}
                  onClick={() => setSelectedComment(c.message)}
                  title={c.author}
                >
                  <span className="text-xs text-gray-500 mr-2">
                    {c.author}:
                  </span>
                  {c.message}
                </li>
              ))}
              {ytComments.length === 0 && !ytLoading && (
                <li className="text-gray-400">コメントがありません</li>
              )}
            </ul>
            <div className="mb-2 text-xs text-gray-500">
              （手動追加コメント）
            </div>
            <ul className="mb-2">
              {COMMENTS.map((comment, idx) => (
                <li
                  key={idx}
                  className={`mb-1 p-2 rounded cursor-pointer ${selectedComment === comment ? 'bg-yellow-200 font-bold' : 'bg-white hover:bg-yellow-100'}`}
                  onClick={() => setSelectedComment(comment)}
                >
                  {comment}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mb-2">
              <button
                className="bg-yellow-500 text-white rounded p-2 disabled:opacity-50"
                onClick={sendUserInput}
                disabled={sending || !selectedComment}
              >
                本人にパス
              </button>
              <button
                className="bg-yellow-700 text-white rounded p-2 disabled:opacity-50"
                onClick={() => setShowPrompt(true)}
                disabled={sending || !selectedComment}
              >
                神の指示を添付
              </button>
            </div>
            {showPrompt && (
              <div className="mb-2 flex gap-2 items-center">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded"
                  placeholder="AIへの指示（システムプロンプト）を入力..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={sending}
                />
                <button
                  className="bg-yellow-700 text-white rounded p-2 disabled:opacity-50"
                  onClick={sendAIGenerate}
                  disabled={sending || !prompt}
                >
                  送信
                </button>
                <button
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    setShowPrompt(false)
                    setPrompt('')
                  }}
                  disabled={sending}
                >
                  キャンセル
                </button>
              </div>
            )}
            {result && (
              <div className="mt-2 text-sm text-center text-gray-700">
                {result}
              </div>
            )}
          </section>

          {/* ゴッド・プロンプター */}
          <section className="bg-purple-50 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">ゴッド・プロンプター</h2>
            <p className="text-sm text-gray-600 mb-2">
              AIへの自由指示を即時送信
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                placeholder="AIへの指示を入力..."
                value={godPrompt}
                onChange={(e) => setGodPrompt(e.target.value)}
                disabled={sending}
              />
              <button
                className="bg-purple-500 text-white rounded p-2 disabled:opacity-50"
                onClick={sendGodPrompt}
                disabled={sending || !godPrompt.trim()}
              >
                囁く
              </button>
            </div>
            {result && (
              <div className="mt-2 text-sm text-center text-gray-700">
                {result}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Cockpit
