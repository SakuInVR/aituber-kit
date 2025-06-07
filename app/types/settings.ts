export type AutoChatSettings = {
  isEnabled: boolean;
  silenceThreshold: number;
  theme: string;
};

export type Settings = {
  autoChat: AutoChatSettings;
  // 他の設定もここに追加
}; 