// pages/tickets/NewTicketPage.jsx
// POST /api/tickets
// Dropdowns: assets, locations, breakdown_types — all fetched via useFetch
// On success: toast → navigate to /tickets

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/authSlice';
import { PageHeader, Button, Input, Select } from '../../components/ui';
import { useToast } from '../../components/feedback/Toast';
import useFetch from '../../hooks/useFetch';
import useMutation from '../../hooks/useMutation';

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
];

// ─── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  asset_id:          '',
  location_id:       '',
  breakdown_type_id: '',
  description:       '',
  priority:          'medium',
};

const NewTicketPage = () => {
  const navigate = useNavigate();
  const toast    = useToast();
  const user     = useSelector(selectUser);

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Dropdown data ──────────────────────────────────────────────────────────
  const { data: assets,         loading: loadingAssets    } = useFetch('/assets');
  const { data: locations,      loading: loadingLocations } = useFetch('/locations');
  const { data: breakdownTypes, loading: loadingBT        } = useFetch('/breakdown-types');

  const dropdownsLoading = loadingAssets || loadingLocations || loadingBT;

  // Build option arrays for Select
  const assetOptions = (assets || []).map((a) => ({
    value: a.id,
    label: `${a.name} — ${a.asset_code}`,
  }));

  const locationOptions = (locations || []).map((l) => ({
    value: l.id,
    label: l.name,
  }));

  const breakdownTypeOptions = (breakdownTypes || []).map((bt) => ({
    value: bt.id,
    label: bt.name,
  }));

  // ── Mutation ───────────────────────────────────────────────────────────────
  const { mutate: createTicket, loading: submitting } = useMutation(
    '/tickets',
    'POST',
    {
      onSuccess: (data) => {
        toast.success(`Ticket ${data.ticket_number} created successfully.`);
        navigate('/tickets', { replace: true });
      },
      onError: (msg) => toast.error(msg),
    }
  );

  // ── Field handlers ─────────────────────────────────────────────────────────
  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // When machine changes — auto-fill location if the asset has one
  const handleAssetChange = (e) => {
    const selectedId = e.target.value;
    setForm((prev) => ({ ...prev, asset_id: selectedId }));
    if (errors.asset_id) setErrors((prev) => ({ ...prev, asset_id: '' }));

    const asset = (assets || []).find((a) => String(a.id) === String(selectedId));
    if (asset?.location_id) {
      setForm((prev) => ({ ...prev, asset_id: selectedId, location_id: String(asset.location_id) }));
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.asset_id)     e.asset_id    = 'Machine is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }

    await createTicket({
      asset_id:          form.asset_id          || undefined,
      location_id:       form.location_id       || undefined,
      breakdown_type_id: form.breakdown_type_id || undefined,
      description:       form.description.trim(),
      priority:          form.priority,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <PageHeader
        title="New Ticket"
        breadcrumbs={[
          { label: 'Tickets', href: '/tickets' },
          { label: 'New Ticket' },
        ]}
        subtitle="Report a machine breakdown"
      />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">

        {/* Reporter info — auto-filled, read only */}
        <div className="flex items-center gap-3 mb-6 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">Reported By</span>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-bold ml-2">{user?.name}</span>
          </div>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-600">Timestamp auto-recorded</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-5">

            {/* Machine — required */}
            <Select
              id="asset_id"
              label="Machine"
              value={form.asset_id}
              onChange={handleAssetChange}
              options={assetOptions}
              placeholder={loadingAssets ? 'Loading machines…' : '— Select machine —'}
              error={errors.asset_id}
              required
              disabled={submitting || loadingAssets}
            />

            {/* Location — auto-filled from machine, editable */}
            <Select
              id="location_id"
              label="Location"
              value={form.location_id}
              onChange={set('location_id')}
              options={locationOptions}
              placeholder={loadingLocations ? 'Loading locations…' : '— Select location —'}
              disabled={submitting || loadingLocations}
            />

            {/* Breakdown Type */}
            <Select
              id="breakdown_type_id"
              label="Breakdown Type"
              value={form.breakdown_type_id}
              onChange={set('breakdown_type_id')}
              options={breakdownTypeOptions}
              placeholder={loadingBT ? 'Loading types…' : '— Select type —'}
              disabled={submitting || loadingBT}
            />

            {/* Priority */}
            <Select
              id="priority"
              label="Priority"
              value={form.priority}
              onChange={set('priority')}
              options={PRIORITY_OPTIONS}
              disabled={submitting}
            />

            {/* Description — required */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Description <span className="text-amber-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe the breakdown — what happened, what you observed, any error codes…"
                value={form.description}
                onChange={set('description')}
                disabled={submitting}
                className={`w-full text-sm px-3 py-2.5 border resize-none transition-colors duration-150 focus:outline-none focus:ring-1
                  bg-white text-gray-900 placeholder-gray-400
                  dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-600
                  ${errors.description
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400 dark:border-red-500 dark:focus:ring-red-500'
                    : 'border-gray-300 hover:border-gray-400 focus:border-amber-500 focus:ring-amber-500 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-amber-500'
                  }
                  ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {errors.description && (
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/tickets')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                disabled={dropdownsLoading}
              >
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicketPage;