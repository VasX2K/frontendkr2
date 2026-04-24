import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, role);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    }
  }

  return <section className="card auth-card">
    <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
    <form onSubmit={submit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" type="password" />
      {mode === 'register' && <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>}
      <button>{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
    </form>
    {error && <p className="error">{error}</p>}
    <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
      {mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт'}
    </button>
    <p className="hint">Демо admin: admin@example.com / admin123. Access token живёт 30 секунд для проверки авто-refresh.</p>
  </section>;
}
