import { create } from "zustand";

interface ThemeStore {
  theme: string;
  setTheme: (themeName: string) => void;
}

export const useThemeStore = create<ThemeStore>()((set) => ({
  theme: localStorage.getItem("theme") || "light",

  setTheme: (themeName) => {
    localStorage.setItem("theme", themeName);
    set({ theme: themeName });
  },
}));
