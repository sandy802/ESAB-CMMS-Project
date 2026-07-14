// pages/master-data/MachinesPage.jsx
// GET    //assets          → list all machines
// POST   //assets          → create
// PATCH  //assets/:id      → update
// DELETE //assets/:id      → delete
//
// GET //locations (for the location dropdown in the form)

import { useState, useCallback } from 'react';
import { PageHeader, DataTable, Modal, Button, Input, Badge } from '../../components/ui';
import { useToast } from '../../components/feedback/Toast';
import useFetch from '../../hooks/useFetch';
import useMutation from '../../hooks/useMutation';

// ─── Confirm delete modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, loading, itemName }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Delete Machine"
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </>
    }
  >
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-gray-100">"{itemName}"</span>?
      This cannot be undone. If this machine has tickets linked, the delete will be blocked.
    </p>
  </Modal>
);

// ─── Asset form modal (create + edit) ────────────────────────────────────────
const AssetFormModal = ({ isOpen, onClose, onSubmit, loading, initial, locations }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, asset_code: initial.asset_code, location_id: initial.location_id || '', description: initial.description || '' }
      : { name: '', asset_code: '', location_id: '', description: '' }
  );
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  const handleOpen = () => {
    if (initial) {
      setForm({ name: initial.name, asset_code: initial.asset_code, location_id: initial.location_id || '', description: initial.description || '' });
    } else {
      setForm({ name: '', asset_code: '', location_id: '', description: '' });
    }
    setErrors({});
  };

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = 'Machine name is required.';
    if (!form.asset_code.trim()) e.asset_code = 'Asset code is required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = {
      name:        form.name.trim(),
      asset_code:  form.asset_code.trim(),
      location_id: form.location_id || null,
      description: form.description.trim() || null,
    };
    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Machine' : 'Add Machine'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save Changes' : 'Add Machine'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          id="name"
          label="Machine Name"
          placeholder="e.g. Welding Machine 1"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          required
          disabled={loading}
        />
        <Input
          id="asset_code"
          label="Asset Code"
          placeholder="e.g. ESAB-WM-001"
          value={form.asset_code}
          onChange={set('asset_code')}
          error={errors.asset_code}
          required
          disabled={loading}
        />
        {/* Location dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Location
          </label>
          <select
            value={form.location_id}
            onChange={set('location_id')}
            disabled={loading}
            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-amber-500 focus:ring-amber-500 disabled:opacity-50"
          >
            <option value="">— No location —</option>
            {(locations || []).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <Input
          id="description"
          label="Description"
          placeholder="Optional notes about this machine"
          value={form.description}
          onChange={set('description')}
          disabled={loading}
        />
      </div>
    </Modal>
  );
};

// ─── Table columns ────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name',          label: 'Machine Name',  width: '28%' },
  { key: 'asset_code',    label: 'Asset Code',    width: '18%' },
  { key: 'location_name', label: 'Location',      width: '20%' },
  { key: 'description',   label: 'Description',   width: '24%' },
  {
    key: 'is_active', label: 'Status', width: '10%',
    render: (val) => <Badge status={val ? 'CLOSED' : 'LOW'} label={val ? 'Active' : 'Inactive'} />,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const MachinesPage = () => {
  const toast = useToast();

  const { data: assets,    loading: loadingAssets,    refetch: refetchAssets    } = useFetch('/assets');
  const { data: locations, loading: loadingLocations                             } = useFetch('/locations');

  const [modal,  setModal]  = useState(null); // null | 'create' | 'edit' | 'delete'
  const [target, setTarget] = useState(null); // the row being edited/deleted

  const openCreate = ()       => { setTarget(null); setModal('create'); };
  const openEdit   = (row)    => { setTarget(row);  setModal('edit'); };
  const openDelete = (row)    => { setTarget(row);  setModal('delete'); };
  const closeModal = ()       => { setModal(null);  setTarget(null); };

  // CREATE
  const { mutate: createAsset, loading: creating } = useMutation('/assets', 'POST', {
    onSuccess: () => { toast.success('Machine added successfully.'); refetchAssets(true); closeModal(); },
    onError:   (msg) => toast.error(msg),
  });

  // PATCH — url changes per target, so we build it dynamically
  const { mutate: updateAsset, loading: updating } = useMutation(
    target ? `/assets/${target.id}` : '/assets',
    'PATCH',
    {
      onSuccess: () => { toast.success('Machine updated.'); refetchAssets(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  // DELETE
  const { mutate: deleteAsset, loading: deleting } = useMutation(
    target ? `/assets/${target.id}` : '/assets',
    'DELETE',
    {
      onSuccess: () => { toast.success('Machine deleted.'); refetchAssets(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Machines"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Machines' }]}
        subtitle="All tracked assets and their locations"
        action={
          <Button variant="primary" size="md" onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Machine
          </Button>
        }
      />

      {/* Error state */}
      {!loadingAssets && assets === null && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
          Failed to load machines. Check your connection or  status.
        </div>
      )}

      <DataTable
        columns={COLUMNS}
        rows={assets || []}
        loading={loadingAssets}
        emptyMessage="No machines found. Add one to get started."
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => openDelete(row)}>Delete</Button>
          </div>
        )}
      />

      {/* Create / Edit modal */}
      {(modal === 'create' || modal === 'edit') && (
        <AssetFormModal
          isOpen
          onClose={closeModal}
          onSubmit={modal === 'create' ? createAsset : updateAsset}
          loading={modal === 'create' ? creating : updating}
          initial={modal === 'edit' ? target : null}
          locations={locations || []}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        onConfirm={() => deleteAsset()}
        loading={deleting}
        itemName={target?.name}
      />
    </div>
  );
};

export default MachinesPage;