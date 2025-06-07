import { useEffect, useRef, useState } from 'react'

interface UseSilenceDetectionOptions {
  threshold?: number // 沈黙と判定する時間（ミリ秒）
  onSilenceStart?: () => void
  onSilenceEnd?: () => void
}

export const useSilenceDetection = ({
  threshold = 20000, // デフォルト20秒
  onSilenceStart,
  onSilenceEnd,
}: UseSilenceDetectionOptions = {}) => {
  const [isSilent, setIsSilent] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // アクティビティを記録する関数
  const recordActivity = () => {
    const now = Date.now()
    lastActivityRef.current = now

    // 沈黙状態だった場合、沈黙終了を通知
    if (isSilent) {
      setIsSilent(false)
      onSilenceEnd?.()
    }

    // 既存のタイマーをクリア
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }

    // 新しいタイマーをセット
    silenceTimerRef.current = setTimeout(() => {
      setIsSilent(true)
      onSilenceStart?.()
    }, threshold)
  }

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [])

  return {
    isSilent,
    recordActivity,
    lastActivityTime: lastActivityRef.current,
  }
}
