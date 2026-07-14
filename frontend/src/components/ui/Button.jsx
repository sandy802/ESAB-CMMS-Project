// Button.jsx — dark/light aware
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none border focus:ring-offset-white dark:focus:ring-offset-gray-950';

  const variants = {
    primary:
      'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 border-amber-500 hover:border-amber-400 focus:ring-amber-500',
    secondary:
      'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400 focus:ring-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:border-gray-500 dark:focus:ring-gray-500',
    danger:
      'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-red-600 hover:border-red-500 focus:ring-red-500',
    ghost:
      'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-500 hover:text-gray-800 border-transparent focus:ring-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-sm gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;