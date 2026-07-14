// pages/UsersPage.jsx
// GET   /users              -> list all users
// POST  /users               -> create
// PATCH /users/:id/deactivate -> deactivate
// (No edit endpoint exists on the backend, only create + deactivate.)

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { PageHeader, DataTable, Modal, Button, Input, Select, Badge } from '../components/ui';
import { useToast } from '../components/feedback/Toast';
import { selectUser } from '../store/authSlice';
import useFetch from '../hooks/useFetch';
import useMutation from '../hooks/useMutation';

const ROLE_OPTIONS = [
  { value: 'admin',       label: 'Admin' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'operator',    label: 'Operator' },
];

const AddUserModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: '' });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required.';
    if (!form.username.trim()) e.username = 'Username is required.';
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (!form.role) e.role = 'Role is required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const result = await onSubmit({
      name: form.name.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
    });
    if (result?.success) {
      setForm({ name: '', username: '', password: '', role: '' });
      setErrors({});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add User"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>Add User</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="e.g. Priya Sharma"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          required
          disabled={loading}
        />
        <Input
          id="username"
          label="Username"
          placeholder="e.g. priya.s"
          value={form.username}
          onChange={set('username')}
          error={errors.username}
          required
          disabled={loading}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          required
          disabled={loading}
        />
        <Select
          id="role"
          label="Role"
          value={form.role}
          onChange={set('role')}
          options={ROLE_OPTIONS}
          placeholder="Select role"
          error={errors.role}
          required
          disabled={loading}
        />
      </div>
    </Modal>
  );
};

const ConfirmDeactivateModal = ({ isOpen, onClose, onConfirm, loading, userName }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Deactivate User"
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Deactivate</Button>
      </>
    }
  >
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Are you sure you want to deactivate{' '}
      <span className="font-bold text-gray-900 dark:text-gray-100">"{userName}"</span>?
      They will no longer be able to log in. This cannot be undone from here.
    </p>
  </Modal>
);

const UsersPage = () => {
  const toast = useToast();
  const currentUser = useSelector(selectUser);

  const { data: users, loading: loadingUsers, refetch: refetchUsers } = useFetch('/users');

  const [modal, setModal]   = useState(null);
  const [target, setTarget] = useState(null);

  const openCreate     = ()    => { setTarget(null); setModal('create'); };
  const openDeactivate = (row) => { setTarget(row);  setModal('deactivate'); };
  const closeModal     = ()    => { setModal(null);  setTarget(null); };

  const { mutate: createUser, loading: creating } = useMutation('/users', 'POST', {
    onSuccess: () => { toast.success('User created successfully.'); refetchUsers(true); closeModal(); },
    onError:   (msg) => toast.error(msg),
  });

  const { mutate: deactivateUser, loading: deactivating } = useMutation(
    target ? `/users/${target.id}/deactivate` : '/users',
    'PATCH',
    {
      onSuccess: () => { toast.success('User deactivated.'); refetchUsers(true); closeModal(); },
      onError:   (msg) => toast.error(msg),
    }
  );

  const COLUMNS = [
    { key: 'name',     label: 'Name',     width: '24%' },
    { key: 'username', label: 'Username', width: '20%' },
    {
      key: 'role', label: 'Role', width: '16%',
      render: (val) => <Badge status={val === 'admin' ? 'HIGH' : val === 'maintenance' ? 'MEDIUM' : 'LOW'} label={val} />,
    },
    {
      key: 'is_active', label: 'Status', width: '14%',
      render: (val) => <Badge status={val ? 'CLOSED' : 'LOW'} label={val ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'last_login_at', label: 'Last Login', width: '18%',
      render: (val) => (val ? new Date(val).toLocaleString() : 'never'),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="User Management"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]}
        subtitle="Manage who can access the system and what they can do"
        action={
          <Button variant="primary" size="md" onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </Button>
        }
      />

      {!loadingUsers && users === null && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
          Failed to load users. Check your connection or admin permissions.
        </div>
      )}

      <DataTable
        columns={COLUMNS}
        rows={users || []}
        loading={loadingUsers}
        emptyMessage="No users found."
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="danger"
              size="sm"
              disabled={!row.is_active || row.id === currentUser?.id}
              onClick={() => openDeactivate(row)}
            >
              {row.id === currentUser?.id ? 'This is you' : row.is_active ? 'Deactivate' : 'Inactive'}
            </Button>
          </div>
        )}
      />

      <AddUserModal
        isOpen={modal === 'create'}
        onClose={closeModal}
        onSubmit={createUser}
        loading={creating}
      />

      <ConfirmDeactivateModal
        isOpen={modal === 'deactivate'}
        onClose={closeModal}
        onConfirm={() => deactivateUser()}
        loading={deactivating}
        userName={target?.name}
      />
    </div>
  );
};

export default UsersPage;
