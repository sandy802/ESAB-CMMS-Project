// components/tickets/CloseTicketModal.jsx
// Used by TicketDetailPage when status === 'IN_PROGRESS'
// Submits PATCH /api/tickets/:id/close
// Props:
//   open        — boolean
//   onClose     — fn
//   rootCauses  — [{ id, name }]
//   mttrReasons — [{ id, name }]
//   onSubmit    — async fn(form) — caller handles mutation + toast
//   loading     — bool — passed from useMutation in the parent

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

const EMPTY_FORM = {
  root_cause_id:    '',
  mttr_reason_id:   '',
  resolution_notes: '',
  parts_replaced:   '',
};

const CloseTicketModal = ({
  open,
  onClose,
  rootCauses  = [],
  mttrReasons = [],
  onSubmit,
  loading = false,
}) => {
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Reset form every time the modal opens
  useEffect(() => {
    if (open) { setForm(EMPTY_FORM); setErrors({}); }
  }, [open]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.root_cause_id)  e.root_cause_id  = 'Root cause is required.';
    if (!form.mttr_reason_id) e.mttr_reason_id = 'MTTR reason is required.';
    if (!form.resolution_notes.trim()) e.resolution_notes = 'Resolution notes are required.';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  const rootCauseOptions  = rootCauses.map((r)  => ({ value: r.id, label: r.name }));
  const mttrReasonOptions = mttrReasons.map((m) => ({ value: m.id, label: m.name }));

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Close Ticket"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Close Ticket
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          id="root_cause_id"
          label="Root Cause"
          value={form.root_cause_id}
          onChange={set('root_cause_id')}
          options={rootCauseOptions}
          placeholder="— Select root cause —"
          error={errors.root_cause_id}
          required
          disabled={loading}
        />

        <Select
          id="mttr_reason_id"
          label="MTTR Reason"
          value={form.mttr_reason_id}
          onChange={set('mttr_reason_id')}
          options={mttrReasonOptions}
          placeholder="— Select MTTR reason —"
          error={errors.mttr_reason_id}
          required
          disabled={loading}
        />

        {/* Resolution Notes — textarea, not Input (multi-line needed) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Resolution Notes <span className="text-amber-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Describe what was done to fix the issue…"
            value={form.resolution_notes}
            onChange={set('resolution_notes')}
            disabled={loading}
            className={`w-full text-sm px-3 py-2.5 border resize-none transition-colors duration-150 focus:outline-none focus:ring-1
              bg-white text-gray-900 placeholder-gray-400
              dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-600
              ${errors.resolution_notes
                ? 'border-red-400 focus:ring-red-400 dark:border-red-500 dark:focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.resolution_notes && (
            <p className="text-xs text-red-500 dark:text-red-400">{errors.resolution_notes}</p>
          )}
        </div>

        <Input
          id="parts_replaced"
          label="Parts Replaced"
          placeholder="e.g. Bearing #6204, Drive belt (optional)"
          value={form.parts_replaced}
          onChange={set('parts_replaced')}
          disabled={loading}
        />
      </div>
    </Modal>
  );
};

export default CloseTicketModal;