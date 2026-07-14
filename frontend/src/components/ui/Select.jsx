// components/ui/Select.jsx
// Styled dropdown that matches Input visually.
// Props: label, id, value, onChange, options, placeholder, error,
//        required, disabled, className
//
// options: [{ value, label }]

const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = '— Select —',
  error = '',
  required = false,
  disabled = false,
  className = '',
}) => {
  const base =
    'w-full text-sm px-3 py-2.5 border transition-colors duration-150 focus:outline-none focus:ring-1 appearance-none cursor-pointer ' +
    'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100';

  const state = error
    ? 'border-red-400 focus:border-red-400 focus:ring-red-400 dark:border-red-500 dark:focus:ring-red-500'
    : 'border-gray-300 hover:border-gray-400 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500 dark:focus:ring-amber-500';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400"
        >
          {label}
          {required && <span className="text-amber-500 ml-1">*</span>}
        </label>
      )}

      {/* Wrapper for custom caret */}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${base} ${state} pr-8 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom caret */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;