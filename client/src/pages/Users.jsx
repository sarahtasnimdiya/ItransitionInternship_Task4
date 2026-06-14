import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Toolbar   from '../components/Toolbar';
import UserTable from '../components/UserTable';
import api       from '../api';

export default function Users({ onLogout }) {
  const [users,       setUsers]       = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null); 
  const [filter,      setFilter]      = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, 'info');
    }
  }, [location.state]);

  useEffect(() => {
    const q = filter.toLowerCase();
    setFiltered(
      q ? users.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      ) : users
    );
    setSelectedIds([]);
  }, [filter, users]);

  function showToast(text, type = 'success') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  const handleAuthError = useCallback((err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      onLogout(err.response.data?.message || 'Session ended. Please log in again.');
    }
  }, [onLogout]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      handleAuthError(err);
      showToast('Failed to load users.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleAction(action) {
    setLoading(true);
    try {
      let result;
      if      (action === 'block')           result = await api.blockUsers(selectedIds);
      else if (action === 'unblock')         result = await api.unblockUsers(selectedIds);
      else if (action === 'delete')          result = await api.deleteUsers(selectedIds);
      else if (action === 'deleteUnverified') result = await api.deleteUnverified(selectedIds);

      showToast(result.message, 'success');
      setSelectedIds([]);
      await fetchUsers();
    } catch (err) {
      handleAuthError(err);
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        showToast(err.response?.data?.message || 'Action failed.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  }


  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <nav className="navbar navbar-expand-lg "
        style={{background: 'linear-gradient(90deg, #0d47a1, #1a73e8)',
            color: 'white'
          }} >
        <div className="container-fluid px-4">
          <span className="navbar-brand fw-semibold text-white d-flex align-items-center gap-2 mb-0">
            <i className="bi bi-people-fill me-2" />
            User Manager
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={() => onLogout()}>
            <i className="bi bi-box-arrow-right me-1" />
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3">

        {toast && (
          <div className={`alert alert-${toast.type} alert-dismissible py-2 mb-3`} role="alert">
            {toast.text}
            <button type="button" className="btn-close" onClick={() => setToast(null)} />
          </div>
        )}

        <div className="card border shadow-sm">
        <Toolbar
          selectedIds={selectedIds}
          users={filtered}
          onAction={handleAction}
          loading={loading}
          filter={filter}
          onFilter={setFilter}
        />

        <UserTable
          users={filtered}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          loading={loading}
        />
        </div>

        <div className="mt-2 text-muted small ps-1">
          {filtered.length} of {users.length} user(s)
        </div>
      </div>
    </div>
  );
}
