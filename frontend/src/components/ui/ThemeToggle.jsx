// ThemeToggle.jsx
// Sun/moon toggle button. Drop anywhere — reads/writes Redux theme state.
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectTheme } from '../../store/themeSlice';

const ThemeToggle = ({ className = '' }) => {
  const dispatch = useDispatch();
  const theme    = useSelector(selectTheme);
  const isDark   = theme === 'dark';

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-150 ${className}`}
    >
      {/* Sun icon — visible in dark mode (click to go light) */}
      <svg
        className={`w-4 h-4 absolute transition-all duration-200 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
      {/* Moon icon — visible in light mode (click to go dark) */}
      <svg
        className={`w-4 h-4 absolute transition-all duration-200 ${!isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </button>
  );
};

export default ThemeToggle;