import React, { useState, useEffect } from 'react'

// スクリプトの型定義
interface Script {
  id: string
  title: string
  content: string
  emotion: string
  createdAt: Date
  updatedAt: Date
}

interface ScriptManagerProps {
  onSelectScript: (script: Script) => void
}

const STORAGE_KEY = 'aituber-scripts'

const ScriptManager: React.FC<ScriptManagerProps> = ({ onSelectScript }) => {
  const [scripts, setScripts] = useState<Script[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentScript, setCurrentScript] = useState<Script | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('neutral')

  // ローカルストレージからスクリプトを読み込む
  useEffect(() => {
    const loadScripts = () => {
      try {
        const savedScripts = localStorage.getItem(STORAGE_KEY)
        if (savedScripts) {
          const parsedScripts = JSON.parse(savedScripts).map((script: any) => ({
            ...script,
            createdAt: new Date(script.createdAt),
            updatedAt: new Date(script.updatedAt),
          }))
          setScripts(parsedScripts)
        }
      } catch (error) {
        console.error('スクリプトの読み込みに失敗しました:', error)
      }
    }

    loadScripts()
  }, [])

  // スクリプトをローカルストレージに保存
  const saveScripts = (newScripts: Script[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScripts))
    } catch (error) {
      console.error('スクリプトの保存に失敗しました:', error)
    }
  }

  // 新規スクリプトの作成
  const createScript = () => {
    const newScript: Script = {
      id: Date.now().toString(),
      title: title || '無題のスクリプト',
      content,
      emotion,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const newScripts = [...scripts, newScript]
    setScripts(newScripts)
    saveScripts(newScripts)
    setTitle('')
    setContent('')
    setEmotion('neutral')
    setIsEditing(false)
  }

  // スクリプトの編集
  const editScript = (script: Script) => {
    setCurrentScript(script)
    setTitle(script.title)
    setContent(script.content)
    setEmotion(script.emotion)
    setIsEditing(true)
  }

  // スクリプトの更新
  const updateScript = () => {
    if (!currentScript) return

    const updatedScripts = scripts.map((script) =>
      script.id === currentScript.id
        ? {
            ...script,
            title: title || '無題のスクリプト',
            content,
            emotion,
            updatedAt: new Date(),
          }
        : script
    )
    setScripts(updatedScripts)
    saveScripts(updatedScripts)
    setTitle('')
    setContent('')
    setEmotion('neutral')
    setIsEditing(false)
    setCurrentScript(null)
  }

  // スクリプトの削除
  const deleteScript = (id: string) => {
    const newScripts = scripts.filter((script) => script.id !== id)
    setScripts(newScripts)
    saveScripts(newScripts)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">スクリプト管理</h2>

      {/* スクリプト一覧 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">保存済みスクリプト</h3>
        <div className="space-y-2">
          {scripts.map((script) => (
            <div
              key={script.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium">{script.title}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(script.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectScript(script)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  実行
                </button>
                <button
                  onClick={() => editScript(script)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  編集
                </button>
                <button
                  onClick={() => deleteScript(script.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
          {scripts.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              保存済みのスクリプトはありません
            </p>
          )}
        </div>
      </div>

      {/* スクリプト編集フォーム */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? 'スクリプトの編集' : '新規スクリプトの作成'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="スクリプトのタイトル"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="スクリプトの内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              感情
            </label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="happy">喜び</option>
              <option value="sad">悲しみ</option>
              <option value="angry">怒り</option>
              <option value="surprised">驚き</option>
              <option value="neutral">通常</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false)
                  setCurrentScript(null)
                  setTitle('')
                  setContent('')
                  setEmotion('neutral')
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                キャンセル
              </button>
            )}
            <button
              onClick={isEditing ? updateScript : createScript}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScriptManager
