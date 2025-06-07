import React, { useState, useEffect, useCallback, useRef } from 'react'
import ScriptManager from './ScriptManager'

// 感情の種類を定義
const emotions = [
  { value: 'happy', label: '喜び', icon: '😊' },
  { value: 'sad', label: '悲しみ', icon: '😢' },
  { value: 'angry', label: '怒り', icon: '😠' },
  { value: 'surprised', label: '驚き', icon: '😲' },
  { value: 'neutral', label: '通常', icon: '😐' },
] as const

type Emotion = (typeof emotions)[number]['value']

// メッセージ履歴の型定義
interface MessageHistory {
  id: string
  text: string
  emotion: Emotion
  timestamp: Date
}

// WebSocket接続の設定
const WS_URL = 'ws://localhost:3001'
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_INTERVAL = 3000 // 3秒
const MAX_HISTORY = 50 // 最大履歴数

const SCAClient: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [message, setMessage] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>('neutral')
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([])
  const [isSending, setIsSending] = useState(false)
  const [showScriptManager, setShowScriptManager] = useState(false)
  const [textInput, setTextInput] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket接続を確立する関数
  const connect = useCallback(() => {
    try {
      const websocket = new WebSocket(WS_URL)

      websocket.onopen = () => {
        console.log('WebSocket接続が確立されました')
        setIsConnected(true)
        setError(null)
        setReconnectAttempts(0)
      }

      websocket.onclose = () => {
        console.log('WebSocket接続が切断されました')
        setIsConnected(false)

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          setError(
            `接続が切断されました。再接続を試みています... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`
          )
          setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1)
            connect()
          }, RECONNECT_INTERVAL)
        } else {
          setError('接続に失敗しました。ページを更新してください。')
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocketエラー:', error)
        setError('接続エラーが発生しました。')
      }

      setWs(websocket)
    } catch (err) {
      console.error('WebSocket接続エラー:', err)
      setError('WebSocket接続に失敗しました。')
    }
  }, [reconnectAttempts])

  useEffect(() => {
    connect()
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [connect])

  const send = async () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('接続が確立されていません。')
      return
    }

    if (!message.trim()) {
      setError('メッセージを入力してください。')
      return
    }

    try {
      setIsSending(true)
      const data = {
        text: message,
        emotion: selectedEmotion,
      }
      ws.send(JSON.stringify(data))

      const newMessage: MessageHistory = {
        id: Date.now().toString(),
        text: message,
        emotion: selectedEmotion,
        timestamp: new Date(),
      }
      setMessageHistory((prev) => [newMessage, ...prev].slice(0, MAX_HISTORY))

      setMessage('')
      setError(null)
    } catch (err) {
      console.error('メッセージ送信エラー:', err)
      setError('メッセージの送信に失敗しました。')
    } finally {
      setIsSending(false)
    }
  }

  // 日時をフォーマットする関数
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  // スクリプトの選択ハンドラー
  const handleScriptSelect = (script: any) => {
    setTextInput(script.content)
    setSelectedEmotion(script.emotion)
    setShowScriptManager(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">配信者制御アプリケーション</h1>
            <button
              onClick={() => setShowScriptManager(!showScriptManager)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showScriptManager ? 'メッセージ入力に戻る' : 'スクリプト管理'}
            </button>
          </div>

          {showScriptManager ? (
            <ScriptManager onSelectScript={handleScriptSelect} />
          ) : (
            <>
              {/* メッセージ入力フォーム */}
              <div className="mb-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="メッセージを入力してください"
                />
              </div>

              {/* 感情選択UI */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  感情を選択
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => setSelectedEmotion(emotion.value)}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        selectedEmotion === emotion.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{emotion.icon}</span>
                      <span className="text-sm">{emotion.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end">
                <button
                  onClick={send}
                  disabled={!textInput.trim() || !wsRef.current}
                  className={`px-4 py-2 rounded ${
                    !textInput.trim() || !wsRef.current
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  送信
                </button>
              </div>

              {/* メッセージ履歴 */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">メッセージ履歴</h2>
                <div className="space-y-2">
                  {messageHistory.map((msg, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{msg.text}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(msg.timestamp).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">
                          {emotions.find((e) => e.value === msg.emotion)?.icon}
                        </span>
                        <span>
                          {emotions.find((e) => e.value === msg.emotion)?.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SCAClient
