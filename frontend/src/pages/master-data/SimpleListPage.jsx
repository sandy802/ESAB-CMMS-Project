// pages/master-data/SimpleListPage.jsx
// Generic page for single-field master data: Breakdown Types, Root Causes, MTTR Reasons.
// All three have the same shape: { id, name, is_active, created_at }
// Pass `config` prop to customise titles and API path.

import { useState } from 'react';
import { PageHeader, DataTable, Modal, Button, Input, Badge } from '../../components/ui';
import { useToast } from '../../components/feedback/Toast';
import useFetch from '../../hooks/useFetch';
import useMutation from '../../hooks/useMutation';

// ─── Form modal ───────────────────────────────────────────────────────────────
const ItemFormModal = ({ isOpen, onClose, onSubmit, loading, initial, config }) => {
  const isEdit = !!initial;
  const [name,  setName]  = useState(initial?.name || '');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError(`${config.fieldLabel} is required.`); return; }
    await onSubmit({ name: name.trim() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit ${config.singular}` : `Add ${config.singular}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Save Changes' : `Add ${config.singular}`}
          </Button>
        </>
      }
    >
      <Input
        id="item-name"
        label={config.fieldLabel}
        placeholder={config.placeholder}
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        error={error}
        required
        disabled={loading}
      />
    </Modal>
  );
};

// ─── Confirm delete ───────────────────────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, loading, itemName, config }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Delete ${config.singular}`}
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
      This will be blocked if it is linked to existing tickets.
    </p>
  </Modal>
);

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'name',      label: 'Name',   width: '70%' },
  {
    key: 'is_active', label: 'Status', width: '30%',
    render: (val) => <Badge status={val ? 'CLOSED' : 'LOW'} label={val ? 'Active' : 'Inactive'} />,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
// config shape:
//   { apiPath, title, singular, subtitle, fieldLabel, placeholder }
const SimpleListPage = ({ config }) => {
  const toast = useToast();
  const { data: items, loading, refetch } = useFetch(config.apiPath);

  const [modal,  setModal]  = useState(null);
  const [target, setTarget] = useState(null);

  const closeModal = () => { setModal(null); setTarget(null); };

  const { mutate: create, loading: creating } = useMutation(config.apiPath, 'POST', {
    onSuccess: () => { toast.success(`${config.singular} added.`); refetch(true); closeModal(); },
    onError:   (msg) => toast.error(msg),
  });

  const { mutate: update, loading: updating } = useMutation(
    target ? `${config.apiPath}/${target.id}` : config.apiPath, 'PATCH',
    {
      onSuccess: () => { toast.success(`${config.singular} updated.`); refetch(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  const { mutate: remove, loading: deleting } = useMutation(
    target ? `${config.apiPath}/${target.id}` : config.apiPath, 'DELETE',
    {
      onSuccess: () => { toast.success(`${config.singular} deleted.`); refetch(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={config.title}
        breadcrumbs={[{ label: 'Master Data' }, { label: config.title }]}
        subtitle={config.subtitle}
        action={
          <Button variant="primary" onClick={() => { setTarget(null); setModal('create'); }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {config.singular}
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        rows={items || []}
        loading={loading}
        emptyMessage={`No ${config.title.toLowerCase()} found. Add one to get started.`}
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setTarget(row); setModal('edit'); }}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => { setTarget(row); setModal('delete'); }}>Delete</Button>
          </div>
        )}
      />

      {(modal === 'create' || modal === 'edit') && (
        <ItemFormModal
          isOpen
          onClose={closeModal}
          onSubmit={modal === 'create' ? create : update}
          loading={modal === 'create' ? creating : updating}
          initial={modal === 'edit' ? target : null}
          config={config}
        />
      )}

      <ConfirmModal
        isOpen={modal === 'delete'}
        onClose={closeModal}
        onConfirm={() => remove()}
        loading={deleting}
        itemName={target?.name}
        config={config}
      />
    </div>
  );
};

export default SimpleListPage;