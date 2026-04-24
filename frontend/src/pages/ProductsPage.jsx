import React, { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

const emptyForm = { title: '', price: '', description: '' };

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  async function loadProducts() {
    const { data } = await api.get('/products');
    setProducts(data);
  }

  useEffect(() => { loadProducts().catch(() => setError('Не удалось загрузить товары')); }, []);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) await api.patch(`/products/${editingId}`, payload);
      else await api.post('/products', payload);
      setForm(emptyForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    }
  }

  async function remove(id) {
    try { await api.delete(`/products/${id}`); await loadProducts(); }
    catch (err) { setError(err.response?.data?.message || 'Ошибка удаления'); }
  }

  function edit(product) {
    setEditingId(product.id);
    setForm({ title: product.title, price: String(product.price), description: product.description || '' });
  }

  return <section>
    <div className="section-header"><h2>Товары</h2>{isAdmin && <span className="badge">admin CRUD enabled</span>}</div>
    {isAdmin && <form className="card form-row" onSubmit={save}>
      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Название" />
      <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Цена" type="number" />
      <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Описание" />
      <button>{editingId ? 'Сохранить' : 'Создать товар'}</button>
      {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Отмена</button>}
    </form>}
    {error && <p className="error">{error}</p>}
    <div className="grid">{products.map(p => <ProductCard key={p.id} product={p} isAdmin={isAdmin} onDelete={remove} onEdit={edit} />)}</div>
  </section>;
}
