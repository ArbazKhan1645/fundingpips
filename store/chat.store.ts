import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: 'Hello! I\'m your FundingPips AI assistant. How can I help you today? I can answer questions about our challenges, trading rules, payouts, and more! 🚀',
  timestamp: new Date(),
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [INITIAL_MESSAGE],
  isTyping: false,
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setTyping: (isTyping) => set({ isTyping }),
  clearMessages: () => set({ messages: [INITIAL_MESSAGE] }),
}));
