// pages/tickets/TicketDetailPage.jsx
// GET  /api/tickets/:id
// PATCH /api/tickets/:id/pickup
// PATCH /api/tickets/:id/close
//
// Fixes from Dev C's version:
//   1. All API paths prefixed with /api/
//   2. Null guard on ticket before render (was crashing on ticket.ticket_number)
//   3. CloseTicketModal loading state wired through
//   4. Field component matches design system (no rounded-xl / shadow)
//   5. MTTR displayed in hours+mins not raw minutes
//   6. Priority badge added to header
//   7. Toast feedback on pickup + close

import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import TicketActions from '../../components/tickets/TicketActions';
import CloseTicketModal from '../../components/tickets/CloseTicketModal';
import useFetch from '../../hooks/useFetch';
import useMutation from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/Toast';

// ─── Field — matches design system ───────────────────────────────────────────
const Field = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
      {value || '—'}
    </span>
  </div>
);

// ─── MTTR formatter ───────────────────────────────────────────────────────────
const formatMTTR = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  high:   'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  low:    'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const TicketDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const role     = useSelector((state) => state.auth.user?.role);

  const [showCloseModal, setShowCloseModal] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: ticket, loading, refetch } = useFetch(`/tickets/${id}`);
  const { data: rootCauses  = []          } = useFetch('/root-causes');
  const { data: mttrReasons = []          } = useFetch('/mttr-reasons');

  // ── Pickup mutation ────────────────────────────────────────────────────────
  const { mutate: pickup, loading: pickupLoading } = useMutation(
    `/tickets/${id}/pickup`,
    'PATCH',
    {
      onSuccess: () => {
        toast.success('Ticket picked up — status set to In Progress.');
        refetch(true);
      },
      onError: (msg) => toast.error(msg),
    }
  );

  // ── Close mutation ─────────────────────────────────────────────────────────
  // NOTE for Dev A: confirm PATCH /api/tickets/:id/close is wired in ticket.routes.js
  // Currently only /pickup is in the routes — /close needs to be added.
  const { mutate: closeTicket, loading: closeLoading } = useMutation(
    `/tickets/${id}/close`,
    'PATCH',
    {
      onSuccess: () => {
        toast.success('Ticket closed successfully.');
        setShowCloseModal(false);
        refetch(true);
      },
      onError: (msg) => toast.error(msg),
    }
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" />
      </div>
    );
  }

  // ── Null guard — ticket not found ──────────────────────────────────────────
  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Ticket not found.</p>
        <Button variant="secondary" onClick={() => navigate('/tickets')}>
          ← Back to Tickets
        </Button>
      </div>
    );
  }

  const mttrFormatted = formatMTTR(ticket.mttr_minutes);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <PageHeader
        title={ticket.ticket_number}
        breadcrumbs={[
          { label: 'Tickets', href: '/tickets' },
          { label: ticket.ticket_number },
        ]}
        subtitle={ticket.asset_name}
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
            ← Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main card ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">

            {/* Ticket header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                  {ticket.asset_name}
                </h2>
                {ticket.breakdown_type && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">{ticket.breakdown_type}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ticket.priority && (
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 border ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium}`}>
                    {ticket.priority}
                  </span>
                )}
                <Badge status={ticket.status} />
              </div>
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <Field label="Machine"       value={ticket.asset_name} />
              <Field label="Location"      value={ticket.location_name} />
              <Field label="Breakdown Type" value={ticket.breakdown_type} />
              <Field label="Reported By"   value={ticket.reported_by_name} />
              {ticket.assigned_to_name && (
                <Field label="Assigned To" value={ticket.assigned_to_name} />
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Description
              </span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-3">
                {ticket.description || '—'}
              </p>
            </div>

            {/* Actions */}
            <TicketActions
              ticket={ticket}
              role={role}
              onPickup={() => pickup()}
              onClose={() => setShowCloseModal(true)}
              pickupLoading={pickupLoading}
            />
          </div>

          {/* ── Resolution card — only when CLOSED ── */}
          {ticket.status === 'CLOSED' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Resolution Report
                </h3>
                {mttrFormatted && (
                  <span className="text-xs font-bold text-green-600 dark:text-green-500">
                    MTTR: {mttrFormatted}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <Field label="Root Cause"     value={ticket.root_cause} />
                <Field label="MTTR Reason"    value={ticket.mttr_reason} />
                <Field label="Closed By"      value={ticket.closed_by_name} />
                <Field label="Parts Replaced" value={ticket.parts_replaced} />
              </div>

              {ticket.resolution_notes && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Resolution Notes
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-4 py-3">
                    {ticket.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Timeline sidebar ── */}
        <div className="lg:col-span-1">
          <TicketTimeline ticket={ticket} />
        </div>
      </div>

      {/* ── Close modal ── */}
      <CloseTicketModal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        rootCauses={rootCauses}
        mttrReasons={mttrReasons}
        onSubmit={(form) => closeTicket(form)}
        loading={closeLoading}
      />
    </div>
  );
};

export default TicketDetailPage;