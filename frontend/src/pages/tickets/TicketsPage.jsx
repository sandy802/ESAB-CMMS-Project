// pages/tickets/TicketsPage.jsx
// GET /api/tickets?status=&asset_id=&breakdown_type_id=&from=&to=&page=&limit=
// Role scoping is handled by the backend — operators see only their own tickets.

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { PageHeader, DataTable, Badge, Button, Input, Select } from '../../components/ui';
import useFetch from '../../hooks/useFetch';
import useTicketFilters from '../../hooks/useTicketFilters';

// ─── Time elapsed helper ──────────────────────────────────────────────────────
// Returns a human-readable string: "2h 14m", "3d 4h", etc.
const timeElapsed = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (days > 0)  return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
};

// ─── Priority dot ─────────────────────────────────────────────────────────────
const PRIORITY_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-gray-400',
};

// ─── Ticket row — custom render for DataTable's `render` prop ─────────────────
// This is the visual layout of one ticket row.
// Used in the `render` function of each column — or we render the whole row
// by using a single spanning cell via onRowClick + custom columns below.

// Column definitions — each `render` function gets (cellValue, fullRow)
const buildColumns = (role) => [
  {
    key: 'ticket_number',
    label: 'Ticket',
    width: '10%',
    render: (val) => (
      <span className="font-bold text-xs text-gray-500 dark:text-gray-400 font-mono">
        {val}
      </span>
    ),
  },
  {
    key: 'asset_name',
    label: 'Machine',
    width: '18%',
    render: (val, row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{val || '—'}</span>
        {row.location_name && (
          <span className="text-xs text-gray-400 dark:text-gray-600">{row.location_name}</span>
        )}
      </div>
    ),
  },
  {
    key: 'breakdown_type',
    label: 'Type',
    width: '16%',
    render: (val) => (
      <span className="text-sm text-gray-600 dark:text-gray-400">{val || '—'}</span>
    ),
  },
  {
    key: 'priority',
    label: 'Priority',
    width: '9%',
    render: (val) => (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[val] || 'bg-gray-400'}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{val || '—'}</span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    width: '12%',
    render: (val) => <Badge status={val} />,
  },
  {
    key: 'reported_by_name',
    label: 'Reported By',
    width: '13%',
    render: (val) => (
      <span className="text-xs text-gray-500 dark:text-gray-500">{val || '—'}</span>
    ),
  },
  {
    key: 'reported_at',
    label: 'Opened',
    width: '12%',
    render: (val, row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
        </span>
        {/* Show elapsed time only for non-closed tickets */}
        {row.status !== 'CLOSED' && val && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-500">
            {timeElapsed(val)} ago
          </span>
        )}
        {row.status === 'CLOSED' && row.mttr_minutes && (
          <span className="text-xs text-green-600 dark:text-green-500">
            MTTR: {Math.round(row.mttr_minutes / 60 * 10) / 10}h
          </span>
        )}
      </div>
    ),
  },
];

// ─── Filter bar ───────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'OPEN',        label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED',      label: 'Closed' },
];

const FilterBar = ({ filters, setFilter, resetFilters, assets, breakdownTypes }) => {
  const assetOptions = (assets || []).map((a) => ({ value: a.id, label: a.name }));
  const btOptions    = (breakdownTypes || []).map((bt) => ({ value: bt.id, label: bt.name }));

  const hasActiveFilters =
    filters.status || filters.asset_id || filters.breakdown_type_id || filters.from || filters.to;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex flex-wrap items-end gap-3">

        {/* Status */}
        <Select
          id="filter-status"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          className="min-w-[140px] flex-1"
        />

        {/* Machine */}
        <Select
          id="filter-asset"
          label="Machine"
          value={filters.asset_id}
          onChange={(e) => setFilter('asset_id', e.target.value)}
          options={assetOptions}
          placeholder="All machines"
          className="min-w-[160px] flex-1"
        />

        {/* Breakdown Type */}
        <Select
          id="filter-bt"
          label="Breakdown Type"
          value={filters.breakdown_type_id}
          onChange={(e) => setFilter('breakdown_type_id', e.target.value)}
          options={btOptions}
          placeholder="All types"
          className="min-w-[160px] flex-1"
        />

        {/* Date from */}
        <Input
          id="filter-from"
          label="From"
          type="date"
          value={filters.from}
          onChange={(e) => setFilter('from', e.target.value)}
          className="min-w-[130px] flex-1"
        />

        {/* Date to */}
        <Input
          id="filter-to"
          label="To"
          type="date"
          value={filters.to}
          onChange={(e) => setFilter('to', e.target.value)}
          className="min-w-[130px] flex-1"
        />

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="md" onClick={resetFilters} className="self-end">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, limit, total, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-xs text-gray-400 dark:text-gray-600">
        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          ← Prev
        </Button>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const TicketsPage = () => {
  const navigate = useNavigate();
  const user     = useSelector(selectUser);
  const role     = user?.role;

  const { filters, setFilter, resetFilters, queryString } = useTicketFilters();

  const { data: ticketData, loading } = useFetch(`/tickets?${queryString}`);
  const { data: assets }              = useFetch('/assets');
  const { data: breakdownTypes }      = useFetch('/breakdown-types');

  const tickets  = ticketData?.data    || [];
  const total    = ticketData?.total   || 0;
  const columns  = buildColumns(role);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tickets"
        breadcrumbs={[{ label: 'Tickets' }]}
        subtitle={
          role === 'operator'
            ? 'Your reported breakdowns'
            : 'All machine breakdown tickets'
        }
        action={
          // Only operator and maintenance can create tickets
          (role === 'operator' || role === 'maintenance') ? (
            <Button variant="primary" onClick={() => navigate('/tickets/new')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </Button>
          ) : null
        }
      />

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        assets={assets}
        breakdownTypes={breakdownTypes}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        rows={tickets}
        loading={loading}
        emptyMessage="No tickets match your filters."
        onRowClick={(row) => navigate(`/tickets/${row.id}`)}
      />

      {/* Pagination */}
      <Pagination
        page={filters.page}
        limit={filters.limit}
        total={total}
        onPageChange={(p) => setFilter('page', p)}
      />
    </div>
  );
};

export default TicketsPage;