import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { useAutoChatStore } from '@/app/features/stores/autoChat'
import { TextButton } from '../textButton'
import {
  handleAutoChatError,
  validateTheme,
  validateSilenceThreshold,
} from '@/utils/errorHandling'

const AutoChat = () => {
  const { t } = useTranslation()
  const {
    isEnabled,
    silenceThreshold,
    currentTheme,
    setEnabled,
    setSilenceThreshold,
    setCurrentTheme,
  } = useAutoChatStore()

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newTheme = e.target.value
      validateTheme(newTheme)
      setCurrentTheme(newTheme)
    } catch (error) {
      handleAutoChatError(error)
    }
  }

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newThreshold = Number(e.target.value) * 1000
      validateSilenceThreshold(newThreshold)
      setSilenceThreshold(newThreshold)
    } catch (error) {
      handleAutoChatError(error)
    }
  }

  return (
    <>
      <div className="flex items-center mb-6">
        <Image
          src="/images/setting-icons/auto-chat-settings.svg"
          alt="Auto Chat Settings"
          width={24}
          height={24}
          className="mr-2"
        />
        <h2 className="text-2xl font-bold">{t('AutoChatSettings')}</h2>
      </div>

      {/* 自動会話の有効/無効切り替え */}
      <div className="mb-6">
        <div className="mb-4 text-xl font-bold">{t('EnableAutoChat')}</div>
        <div className="mb-4 text-base whitespace-pre-wrap">
          {t('EnableAutoChatInfo')}
        </div>
        <div className="my-2">
          <TextButton onClick={() => setEnabled(!isEnabled)}>
            {isEnabled ? t('StatusOn') : t('StatusOff')}
          </TextButton>
        </div>
      </div>

      {/* 沈黙検知の閾値設定 */}
      <div className="mb-6">
        <div className="mb-4 text-xl font-bold">{t('SilenceThreshold')}</div>
        <div className="mb-4 text-base whitespace-pre-wrap">
          {t('SilenceThresholdInfo')}
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min="5"
            max="60"
            value={silenceThreshold / 1000}
            onChange={handleThresholdChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium">
            {silenceThreshold / 1000}秒
          </span>
        </div>
      </div>

      {/* 配信テーマ入力 */}
      <div className="mb-6">
        <div className="mb-4 text-xl font-bold">{t('StreamTheme')}</div>
        <div className="mb-4 text-base whitespace-pre-wrap">
          {t('StreamThemeInfo')}
        </div>
        <input
          type="text"
          value={currentTheme}
          onChange={handleThemeChange}
          placeholder={t('StreamThemePlaceholder')}
          className="text-ellipsis px-4 py-2 w-col-span-2 bg-white hover:bg-white-hover rounded-lg"
        />
      </div>
    </>
  )
}

export default AutoChat
