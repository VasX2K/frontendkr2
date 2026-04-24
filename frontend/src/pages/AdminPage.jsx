import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

export function AdminPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  async function loadUsers() {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  }

  useEffect(() => { if (isAdmin) loadUsers().catch(err => setError(err.response?.data?.message || 'Нет доступа')); }, [isAdmin]);

  async function changeRole(id, role) {
    try { await api.patch(`/admin/users/${id}/role`, { role }); await loadUsers(); }
    catch (err) { setError(err.response?.data?.message || 'Ошибка смены роли'); }
  }

  if (!isAdmin) return <section className="card"><h2>Админ-панель</h2><p className="error">Недостаточно прав</p></section>;

  return <section className="card">
    <h2>Админ-панель: пользователи</h2>
    {error && <p className="error">{error}</p>}
    <table>
      <thead><tr><th>ID</th><th>Email</th><th>Role</th><th>Действие</th></tr></thead>
      <tbody>{users.map(u => <tr key={u.id}>
        <td>{u.id}</td><td>{u.email}</td><td>{u.role}</td>
        <td><select value={u.role} onChange={e => changeRole(u.id, e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></td>
      </tr>)}</tbody>
    </table>
  </section>;
}
