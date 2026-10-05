import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div className="theme-picker">
      <button className="theme-trigger" onClick={() => setOpen(v => !v)} aria-label="تغییر تم">
        <span>✦</span><small>{themes.find(t => t.key === theme)?.label}</small>
      </button>
      {open && (
        <div className="theme-menu">
          {themes.map(t => (
            <button key={t.key} className={theme === t.key ? 'selected' : ''} onClick={() => { setTheme(t.key); setOpen(false); }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
