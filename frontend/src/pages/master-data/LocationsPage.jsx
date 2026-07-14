// pages/master-data/LocationsPage.jsx
// GET    /api/locations       → list
// POST   /api/locations       → create
// PATCH  /api/locations/:id   → update
// DELETE /api/locations/:id   → delete

import { useState } from 'react';
import { PageHeader, DataTable, Modal, Button, Input, Badge } from '../../components/ui';
import { useToast } from '../../components/feedback/Toast';
import useFetch from '../../hooks/useFetch';
import useMutation from '../../hooks/useMutation';

// ─── Form modal ───────────────────────────────────────────────────────────────
const LocationFormModal = ({ isOpen, onClose, onSubmit, loading, initial }) => {
  const isEdit = !!initial;
  const [form, setForm]     = useState(initial ? { name: initial.name, description: initial.description || '' } : { name: '', description: '' });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Location name is required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    await onSubmit({ name: form.name.trim(), description: form.description.trim() || null });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Location' : 'Add Location'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save Changes' : 'Add Location'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          id="loc-name"
          label="Location Name"
          placeholder="e.g. Shop Floor A"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          required
          disabled={loading}
        />
        <Input
          id="loc-desc"
          label="Description"
          placeholder="Optional description"
          value={form.description}
          onChange={set('description')}
          disabled={loading}
        />
      </div>
    </Modal>
  );
};

// ─── Confirm delete ───────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, loading, itemName }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Delete Location"
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </>
    }
  >
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Delete <span className="font-bold text-gray-900 dark:text-gray-100">"{itemName}"</span>?
      This will be blocked if machines are assigned to this location.
    </p>
  </Modal>
);

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name',        label: 'Location Name', width: '30%' },
  { key: 'description', label: 'Description',   width: '50%' },
  {
    key: 'is_active', label: 'Status', width: '20%',
    render: (val) => <Badge status={val ? 'CLOSED' : 'LOW'} label={val ? 'Active' : 'Inactive'} />,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const LocationsPage = () => {
  const toast = useToast();
  const { data: locations, loading, refetch } = useFetch('/locations');

  const [modal,  setModal]  = useState(null);
  const [target, setTarget] = useState(null);

  const closeModal = () => { setModal(null); setTarget(null); };

  const { mutate: create, loading: creating } = useMutation('/locations', 'POST', {
    onSuccess: () => { toast.success('Location added.'); refetch(true); closeModal(); },
    onError:   (msg) => toast.error(msg),
  });

  const { mutate: update, loading: updating } = useMutation(
    target ? `/locations/${target.id}` : '/locations', 'PATCH',
    {
      onSuccess: () => { toast.success('Location updated.'); refetch(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  const { mutate: remove, loading: deleting } = useMutation(
    target ? `/locations/${target.id}` : '/locations', 'DELETE',
    {
      onSuccess: () => { toast.success('Location deleted.'); refetch(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Locations"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Locations' }]}
        subtitle="Plant areas and zones assigned to machines"
        action={
          <Button variant="primary" onClick={() => { setTarget(null); setModal('create'); }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Location
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={locations || []}
        loading={loading}
        emptyMessage="No locations found. Add one to get started."
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setTarget(row); setModal('edit'); }}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => { setTarget(row); setModal('delete'); }}>Delete</Button>
          </div>
        )}
      />

      {(modal === 'create' || modal === 'edit') && (
        <LocationFormModal
          isOpen
          onClose={closeModal}
          onSubmit={modal === 'create' ? create : update}
          loading={modal === 'create' ? creating : updating}
          initial={modal === 'edit' ? target : null}
        />
      )}

      <ConfirmModal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        onConfirm={() => remove()}
        loading={deleting}
        itemName={target?.name}
      />
    </div>
  );
};

export default LocationsPage;