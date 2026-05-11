import { create } from 'zustand';

interface UIStore {
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  isNavScrolled: boolean;
  toggleSidebar: () => void;
  toggleChat: () => void;
  setNavScrolled: (scrolled: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: true,
  isChatOpen: false,       // never persisted — always starts closed
  isNavScrolled: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  setNavScrolled: (isNavScrolled) => set({ isNavScrolled }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
}));
