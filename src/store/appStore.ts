import { create } from 'zustand';
import type { AppPage } from '@/types';

interface AppState {
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),
}));
