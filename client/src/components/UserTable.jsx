import { useRef, useEffect } from 'react';

function getUniqIdValue(prefix, id) {
  return `${prefix}-${id}`;
}

function timeAgo(date) {
  if (!date) return null;
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60)    return 'less than a minute ago';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

function exactTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function StatusText({ status }) {
  const colors = { active: '#198754', blocked: '#dc3545', unverified: '#6c757d' };
  return (
    <span style={{ color: colors[status] ?? '#333', fontWeight: 500 }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function UserTable({ users, selectedIds, onSelectChange, loading }) {
  const allSelected  = users.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  
  const selectAllRef = useRef(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function toggleAll() {
    onSelectChange(allSelected ? [] : users.map(u => u.id));
  }

  function toggleOne(id) {
    onSelectChange(
      selectedIds.includes(id)
        ? selectedIds.filter(s => s !== id)
        : [...selectedIds, id]
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-secondary" />
      </div>
    );
  }

  return (
    <table className="table table-hover mb-0" style={{ fontSize: 14 }}>
      <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6' }}>
            <th style={{ width: 44, paddingLeft: 16  }} className="py-3">
              <input
                type="checkbox"
                className="form-check-input"
                id={getUniqIdValue('chk', 'all')}
                ref={selectAllRef}
                checked={allSelected}
                onChange={toggleAll}
                title="Select / deselect all"
              />
            </th>
            <th className="py-3 fw-semibold">Name</th>
            <th className="py-3 fw-semibold">Email <i className="bi bi-arrow-down" style={{ fontSize: 11 }} />
            </th>
            <th className="py-3 fw-semibold">Status</th>
            <th className="py-3 fw-semibold">Last seen</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted py-5">
                No users found.
              </td>
            </tr>
          ) : (
            users.map(user => {
              const checked = selectedIds.includes(user.id);
              const blocked  = user.status === 'blocked';
              const relative = timeAgo(user.last_login);
              const exact    = exactTime(user.last_login);
              return (
                <tr key={user.id} style={{ background: checked ? '#e8f0fe' : 'transparent' }}>
                    <td style={{ paddingLeft: 16, verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={getUniqIdValue('chk', user.id)}
                        checked={checked}
                        onChange={() => toggleOne(user.id)}
                      />
                    </td>

                    <td style={{ verticalAlign: 'middle' }}>
                    <div style={blocked
                      ? { textDecoration: 'line-through', color: '#888' }
                      : { color: '#212529' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#9e9e9e', marginTop: 1 }}>
                      N/A
                    </div>
                  </td>

                  <td style={{ verticalAlign: 'middle', color: blocked ? '#aaa' : '#212529' }}>
                    {user.email}
                  </td>

                  <td style={{ verticalAlign: 'middle' }}>
                    <StatusText status={user.status} />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    {relative ? (
                      <>
                        <div>{relative}</div>
                        <div
                          style={{
                            fontSize: 11, color: '#9e9e9e', marginTop: 2,
                            cursor: 'help', borderBottom: '1px dotted #bbb',
                            display: 'inline-block',
                          }}
                          title={exact}
                        >
                          {exact}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted">Never logged in</span>
                    )}
                  </td>
                 </tr>
              );
            })
          )}
        </tbody>
      </table>
  );
}
