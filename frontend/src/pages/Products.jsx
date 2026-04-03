import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api.jsx';
import { useAuth } from '../AuthContext.jsx';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await productsAPI.delete(id);
      fetchProducts();
    } catch (err) {
      alert('Ошибка удаления товара');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div>
      <div className="header-row">
        <h2>Товары</h2>
        {(user.role === 'seller' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            Добавить товар
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {products.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Товары не найдены</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <h3>{product.title}</h3>
              <div className="category">Категория: {product.category}</div>
              <div className="description">{product.description}</div>
              <div className="price">{product.price} ₽</div>

              <div className="actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                  Редактировать
                </button>
                {user.role === 'admin' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
