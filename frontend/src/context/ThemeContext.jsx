import React, { createContext, useContext, useEffect, useState } from 'react';

const THEMES = [
  { key: 'midnight', label: 'Midnight', icon: '◐' },
  { key: 'paper', label: 'Paper', icon: '○' },
  { key: 'aurora', label: 'Aurora', icon: '✦' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('codesazan-theme') || 'midnight');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('codesazan-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
