import { Switch } from '@headlessui/react'
import { useAutoChatStore } from '@/app/features/stores/autoChat'
import { useAutoChat } from '@/app/hooks/useAutoChat'
import { useTranslation } from 'react-i18next'

export const AutoChatSettings = () => {
  const { t } = useTranslation()
  const {
    isEnabled,
    silenceThreshold,
    currentTheme,
    provider,
    setEnabled,
    setSilenceThreshold,
    setCurrentTheme,
    setProvider,
  } = useAutoChatStore()

  const { remainingTime, isGenerating } = useAutoChat()

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
          onChange={setEnabled}
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
          onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai')}
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
          onChange={(e) => setSilenceThreshold(Number(e.target.value) * 1000)}
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
          onChange={(e) => setCurrentTheme(e.target.value)}
          placeholder={t('StreamThemePlaceholder')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* 生成中の状態表示 */}
      {isGenerating && (
        <div className="text-sm text-blue-600">{t('GeneratingAutoChat')}</div>
      )}
    </div>
  )
}
