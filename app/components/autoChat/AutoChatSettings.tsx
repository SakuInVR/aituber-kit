import { useAutoChatSettings } from '@/hooks/autoChat/useAutoChatSettings';
import { Switch } from '@headlessui/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AutoChatSettings() {
  const { isEnabled, silenceThreshold, theme, updateSettings } = useAutoChatSettings();

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-chat-enabled">自動会話を有効化</Label>
        <Switch
          checked={isEnabled}
          onChange={(checked) => updateSettings({ isEnabled: checked })}
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

      <div className="space-y-2">
        <Label htmlFor="silence-threshold">沈黙検知の閾値（ミリ秒）</Label>
        <Input
          id="silence-threshold"
          type="number"
          value={silenceThreshold}
          onChange={(e) =>
            updateSettings({ silenceThreshold: parseInt(e.target.value, 10) })
          }
          min={5000}
          max={60000}
          step={1000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">配信テーマ</Label>
        <Input
          id="theme"
          type="text"
          value={theme}
          onChange={(e) => updateSettings({ theme: e.target.value })}
          placeholder="例：ゲーム配信、雑談配信など"
        />
      </div>
    </div>
  );
} 