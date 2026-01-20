// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = "light" | "dark";

function isTheme(value: string): value is Theme {
  return value === 'light' || value === 'dark';
}

function getThemeFromStorage(): Theme | null {
  const raw = localStorage.getItem('theme');
  if (!raw) return null;
  return isTheme(raw) ? raw : null;
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPreferTheme(): Theme {
  if (typeof window === "undefined") return "light"; // SSR 안전
  const savedTheme = getThemeFromStorage();
  return savedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches
       ? "dark"
       : "light");
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => getSystemPreferTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
