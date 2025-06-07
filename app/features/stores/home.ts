import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatLog } from '@/types/chat';

export const useHomeStore = create<{
  chatLog: ChatLog;
  setState: (updater: (state: { chatLog: ChatLog }) => { chatLog: ChatLog }) => void;
}>()(
  persist(
    (set) => ({
      chatLog: [],
      setState: (updater) => set(updater),
    }),
    {
      name: 'home-storage',
    }
  )
); 