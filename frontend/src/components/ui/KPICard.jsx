// KPICard.jsx — dark/light aware
const KPICard = ({ title, value, unit, icon, trend, trendValue, loading = false, className = '' }) => {
  const trendConfig = {
    up:      { color: 'text-green-600 dark:text-green-400', arrow: '↑' },
    down:    { color: 'text-red-600 dark:text-red-400',     arrow: '↓' },
    neutral: { color: 'text-gray-400',                      arrow: '→' },
  };
  const t = trend ? trendConfig[trend] : null;

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</span>
        {icon && (
          <span className="text-amber-500/50 group-hover:text-amber-500 transition-colors duration-200">{icon}</span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">{value ?? '—'}</span>
          {unit && <span className="text-sm font-medium text-gray-400 dark:text-gray-500">{unit}</span>}
        </div>
      )}
      {t && trendValue && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${t.color}`}>
          <span>{t.arrow}</span><span>{trendValue}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-500/0 group-hover:bg-amber-500/30 transition-all duration-200" />
    </div>
  );
};

export default KPICard;