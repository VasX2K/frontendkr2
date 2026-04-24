<<<<<<< HEAD
import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './context/AuthContext';
import { ProductsPage } from './pages/ProductsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import './styles/main.scss';

export default function App() {
  const { user, loading, logout, isAdmin } = useAuth();
  const [page, setPage] = useState('products');

  if (loading) return <main className="container"><p>Загрузка...</p></main>;
  if (!user) return <main className="container"><AuthForm /></main>;

  return <main className="container">
    <header className="topbar">
      <div><h1>RBAC Products</h1><p>{user.email} · <b>{user.role}</b></p></div>
      <nav>
        <button onClick={() => setPage('products')}>Товары</button>
        <button onClick={() => setPage('profile')}>Мои данные</button>
        {isAdmin && <button onClick={() => setPage('admin')}>Админка</button>}
        <button className="danger" onClick={logout}>Выйти</button>
      </nav>
    </header>
    {page === 'products' && <ProductsPage />}
    {page === 'profile' && <ProfilePage />}
    {page === 'admin' && <AdminPage />}
  </main>;
}
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Users from './pages/Users.jsx';
import UserForm from './pages/UserForm.jsx';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/products" />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Shop App</h1>
          <div className="nav-links">
            {user ? (
              <>
                <span className="user-info">
                  {user.first_name} {user.last_name} ({user.role})
                </span>
                <a href="/products">Товары</a>
                {user.role === 'admin' && <a href="/users">Пользователи</a>}
                <button onClick={() => window.location.href = '/logout'} className="btn-logout">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <a href="/login">Войти</a>
                <a href="/register">Регистрация</a>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['user', 'seller', 'admin']}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['seller', 'admin']}>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? '/products' : '/login'} />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
>>>>>>> e6cd4a2a0d8b31af6d74757571e9e47865cf9b69
