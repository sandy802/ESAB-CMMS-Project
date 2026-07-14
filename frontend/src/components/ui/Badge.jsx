// Badge.jsx — dark/light aware
const STATUS_CONFIG = {
  OPEN:        { label: 'Open',        classes: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',       dot: 'bg-red-500 dark:bg-red-400' },
  IN_PROGRESS: { label: 'In Progress', classes: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500 dark:bg-amber-400' },
  CLOSED:      { label: 'Closed',      classes: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30',  dot: 'bg-green-500 dark:bg-green-400' },
  RESOLVED:    { label: 'Resolved',    classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',    dot: 'bg-blue-500 dark:bg-blue-400' },
  HIGH:        { label: 'High',        classes: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30',       dot: 'bg-red-500 dark:bg-red-400' },
  MEDIUM:      { label: 'Medium',      classes: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500 dark:bg-amber-400' },
  LOW:         { label: 'Low',         classes: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30',   dot: 'bg-gray-400' },
};

const Badge = ({ status, label, showDot = true, className = '' }) => {
  const key = status?.toUpperCase();
  const config = STATUS_CONFIG[key] || {
    label: label || status || 'Unknown',
    classes: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30',
    dot: 'bg-gray-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold tracking-wide border ${config.classes} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />}
      {label || config.label}
    </span>
  );
};

export default Badge;