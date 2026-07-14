// components/tickets/TicketTimeline.jsx
// Vertical status timeline: Opened → Picked Up → Closed
// Matches the flat/industrial design system (no rounded-2xl, no shadow-sm)

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
};

const formatElapsed = (dateStr) => {
  if (!dateStr) return null;
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${mins % 60}m ago`;
  return `${mins}m ago`;
};

// ─── Single timeline step ─────────────────────────────────────────────────────
const TimelineStep = ({ label, timestamp, assignedTo, completed, isLast }) => (
  <div className="flex gap-4">
    {/* Track */}
    <div className="flex flex-col items-center">
      <div
        className={`w-3 h-3 rounded-full border-2 shrink-0 mt-1 ${
          completed
            ? 'bg-amber-500 border-amber-500'
            : 'bg-transparent border-gray-300 dark:border-gray-700'
        }`}
      />
      {!isLast && (
        <div
          className={`w-px flex-1 min-h-[52px] mt-1 ${
            completed ? 'bg-amber-500/40' : 'bg-gray-200 dark:bg-gray-800'
          }`}
        />
      )}
    </div>

    {/* Content */}
    <div className="pb-6 flex-1">
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold uppercase tracking-widest ${
            completed
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-gray-400 dark:text-gray-600'
          }`}
        >
          {label}
        </span>
        {completed && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
      </div>

      {timestamp ? (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(timestamp)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
            {formatElapsed(timestamp)}
          </p>
          {assignedTo && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 font-medium">
              by {assignedTo}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">Pending</p>
      )}
    </div>
  </div>
);

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TicketTimeline = ({ ticket }) => {
  if (!ticket) return null;

  // MTTR in hours + minutes
  const mttrLabel = ticket.mttr_minutes
    ? `${Math.floor(ticket.mttr_minutes / 60)}h ${ticket.mttr_minutes % 60}m`
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Status Timeline
        </h3>
        {mttrLabel && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            MTTR: {mttrLabel}
          </div>
        )}
      </div>

      {/* Steps */}
      <TimelineStep
        label="Ticket Opened"
        timestamp={ticket.reported_at}
        assignedTo={ticket.reported_by_name}
        completed
      />
      <TimelineStep
        label="Picked Up"
        timestamp={ticket.assigned_at}
        assignedTo={ticket.assigned_to_name}
        completed={!!ticket.assigned_at}
      />
      <TimelineStep
        label="Ticket Closed"
        timestamp={ticket.closed_at}
        assignedTo={ticket.closed_by_name}
        completed={!!ticket.closed_at}
        isLast
      />
    </div>
  );
};

export default TicketTimeline;