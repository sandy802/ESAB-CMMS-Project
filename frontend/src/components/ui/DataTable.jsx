// DataTable.jsx — dark/light aware
const DataTable = ({ columns = [], rows = [], actions, loading = false, emptyMessage = 'No records found.', onRowClick, className = '' }) => {
  const headerCls = 'px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500';
  const theadCls  = 'border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80';

  if (loading) {
    return (
      <div className={`border border-gray-200 dark:border-gray-800 overflow-hidden ${className}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadCls}>
              {columns.map((col) => <th key={col.key} className={`${headerCls} text-left`} style={{ width: col.width }}>{col.label}</th>)}
              {actions && <th className={`${headerCls} w-24`} />}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-sm" style={{ width: `${60 + (i * 7) % 30}%` }} />
                  </td>
                ))}
                {actions && <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-sm" /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={`border border-gray-200 dark:border-gray-800 overflow-hidden ${className}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadCls}>
              {columns.map((col) => <th key={col.key} className={`${headerCls} text-left`} style={{ width: col.width }}>{col.label}</th>)}
              {actions && <th className={`${headerCls} w-24`} />}
            </tr>
          </thead>
        </table>
        <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-600">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-800 overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={theadCls}>
            {columns.map((col) => (
              <th key={col.key} className={`${headerCls} ${col.align === 'right' ? 'text-right' : 'text-left'}`} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
            {actions && <th className={`${headerCls} text-right w-24`}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-100 dark:border-gray-800/50 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;