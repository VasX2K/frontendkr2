import React from 'react';
export function ProductCard({ product, isAdmin, onDelete, onEdit }) {
  return <article className="product-card">
    <h3>{product.title}</h3>
    <p className="price">{product.price} ₽</p>
    <p>{product.description || 'Без описания'}</p>
    {isAdmin && <div className="actions">
      <button onClick={() => onEdit(product)}>Изменить</button>
      <button className="danger" onClick={() => onDelete(product.id)}>Удалить</button>
    </div>}
  </article>;
}
