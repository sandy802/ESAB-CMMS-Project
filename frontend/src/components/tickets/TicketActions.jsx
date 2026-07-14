// components/tickets/TicketActions.jsx
// Renders action buttons based on ticket status and user role.
// Operators see nothing — they can only view.
// Maintenance/Admin:
//   OPEN        → "Pick Up" button
//   IN_PROGRESS → "Close Ticket" button
//   CLOSED      → nothing (read-only)
//
// Props:
//   ticket       — full ticket object
//   role         — user's role string
//   onPickup     — fn
//   onClose      — fn (opens CloseTicketModal)
//   pickupLoading — bool

import Button from '../ui/Button';

const TicketActions = ({ ticket, role, onPickup, onClose, pickupLoading = false }) => {
  // Only maintenance can act on tickets — everyone else is read-only
  if (!ticket || role !== 'maintenance') return null;
  // Closed tickets have no actions
  if (ticket.status === 'CLOSED') return null;

  return (
    <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mr-auto">
        Actions
      </span>

      {ticket.status === 'OPEN' && (
        <Button
          variant="secondary"
          onClick={onPickup}
          loading={pickupLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Pick Up Ticket
        </Button>
      )}

      {ticket.status === 'IN_PROGRESS' && (
        <Button
          variant="primary"
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Close Ticket
        </Button>
      )}
    </div>
  );
};

export default TicketActions;