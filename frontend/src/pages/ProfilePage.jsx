import React from 'react';
import { useAuth } from '../context/AuthContext';
export function ProfilePage() {
  const { user } = useAuth();
  return <section className="card"><h2>Мои данные</h2><pre>{JSON.stringify(user, null, 2)}</pre></section>;
}
