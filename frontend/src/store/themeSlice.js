// store/themeSlice.js
// Owns theme state: 'dark' | 'light'
// Persists to localStorage so preference survives page refresh.
// Syncs the 'dark' class on <html> so Tailwind's darkMode: 'class' works.

import { createSlice } from '@reduxjs/toolkit';

// Read saved preference, fall back to system preference, then 'dark'
const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem('cmms_theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage blocked (private browsing, etc.)
  }
  // Check OS preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

const applyThemeToDOM = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply on slice init (before first render)
const initialTheme = getSavedTheme();
applyThemeToDOM(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme, // 'dark' | 'light'
  },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(state.mode);
      try {
        localStorage.setItem('cmms_theme', state.mode);
      } catch {
        // ignore
      }
    },
    setTheme(state, action) {
      state.mode = action.payload;
      applyThemeToDOM(state.mode);
      try {
        localStorage.setItem('cmms_theme', state.mode);
      } catch {
        // ignore
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectTheme  = (state) => state.theme.mode;
export const selectIsDark = (state) => state.theme.mode === 'dark';

export default themeSlice.reducer;