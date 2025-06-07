import { toast } from 'react-hot-toast';

type TTSOptions = {
  message: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry';
  voice?: string;
};

export async function speakCharacter(sessionId: string, options: TTSOptions) {
  try {
    const response = await fetch('/api/tts-nijivoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: options.message,
        emotion: options.emotion || 'neutral',
        voice: options.voice,
      }),
    });

    if (!response.ok) {
      throw new Error('TTSの生成に失敗しました');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.error('TTSエラー:', error);
    toast.error('音声の生成に失敗しました');
  }
} 