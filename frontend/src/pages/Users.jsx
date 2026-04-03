import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../api.jsx';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
      return;
    }

    try {
      await usersAPI.delete(id);
      fetchUsers();
    } catch (err) {
      alert('Ошибка блокировки пользователя');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div>
      <div className="header-row">
        <h2>Управление пользователями</h2>
      </div>

      {error && <div className="error">{error}</div>}

      {users.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Пользователи не найдены</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={async (e) => {
                      try {
                        await usersAPI.update(user.id, { role: e.target.value });
                        fetchUsers();
                      } catch (err) {
                        alert('Ошибка обновления роли');
                      }
                    }}
                  >
                    <option value="user">Пользователь</option>
                    <option value="seller">Продавец</option>
                    <option value="admin">Администратор</option>
                  </select>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    Редактировать
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Заблокировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Users;
