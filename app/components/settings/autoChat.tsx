import { Switch } from '@headlessui/react'
import { useAutoChatStore } from '@/app/features/stores/autoChat'
import { useAutoChat } from '@/app/hooks/useAutoChat'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export const AutoChatSettings = () => {
  const { t } = useTranslation()
  const {
    isEnabled,
    silenceThreshold,
    currentTheme,
    provider,
    mode,
    setEnabled,
    setSilenceThreshold,
    setCurrentTheme,
    setProvider,
    setMode,
  } = useAutoChatStore()

  const { remainingTime, isGenerating } = useAutoChat()

  // 状態表示用のstate
  const [status, setStatus] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info' | null>(null)

  // ON/OFF切替時のハンドラ
  const handleToggle = (value: boolean) => {
    setEnabled(value)
    if (value) {
      setStatus('自動会話が有効になりました')
      setStatusType('success')
    } else {
      setStatus('自動会話が無効になりました')
      setStatusType('info')
    }
  }

  // プロバイダー変更
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvider(e.target.value as 'gemini' | 'openai')
    setStatus('AIプロバイダーを変更しました')
    setStatusType('success')
  }

  // 閾値変更
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSilenceThreshold(Number(e.target.value) * 1000)
    setStatus('沈黙検知の閾値を変更しました')
    setStatusType('success')
  }

  // テーマ変更
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTheme(e.target.value)
    setStatus('配信テーマを変更しました')
    setStatusType('success')
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">{t('AutoChatSettings')}</h2>

      {/* 有効/無効切り替え */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {t('EnableAutoChat')}
        </span>
        <Switch
          checked={isEnabled}
          onChange={handleToggle}
          className={`${
            isEnabled ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>

      {/* AIプロバイダー選択 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('AutoChatProvider')}
        </label>
        <select
          value={provider}
          onChange={handleProviderChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      {/* 沈黙検知の閾値設定 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('SilenceThreshold')}
        </label>
        <input
          type="number"
          min="5"
          max="60"
          value={silenceThreshold / 1000}
          onChange={handleThresholdChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {isEnabled && remainingTime !== null && (
          <div className="text-sm text-gray-500">
            {t('RemainingTime', { time: Math.ceil(remainingTime / 1000) })}
          </div>
        )}
      </div>

      {/* 配信テーマ入力 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('StreamTheme')}
        </label>
        <input
          type="text"
          value={currentTheme}
          onChange={handleThemeChange}
          placeholder={t('StreamThemePlaceholder')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* 自動会話モード選択 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          自動会話モード
        </label>
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as 'once' | 'repeat')
            setStatus(
              e.target.value === 'once'
                ? '自動会話は一回限りで発話後OFFになります'
                : '自動会話は沈黙検知のたびに繰り返し発話します'
            )
            setStatusType('info')
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="repeat">繰り返し（デフォルト）</option>
          <option value="once">一回限り</option>
        </select>
      </div>

      {/* 生成中の状態表示 */}
      {isGenerating && (
        <div className="text-sm text-blue-600">{t('GeneratingAutoChat')}</div>
      )}

      {/* 状態表示・フィードバック */}
      {status && (
        <div
          className={`mt-4 text-sm text-center rounded p-2 ${
            statusType === 'success'
              ? 'bg-green-100 text-green-700'
              : statusType === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {status}
        </div>
      )}
    </div>
  )
}
