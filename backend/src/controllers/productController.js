import { readProducts, writeProducts, validateProductPayload } from '../services/productStore.js';

export async function getProducts(req, res) { res.json(await readProducts()); }
export async function getProduct(req, res) {
  const product = (await readProducts()).find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  res.json(product);
}
export async function createProduct(req, res) {
  const errors = validateProductPayload(req.body);
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  const products = await readProducts();
  const product = { id: Date.now().toString(), title: req.body.title.trim(), price: req.body.price, description: req.body.description || '', createdAt: new Date().toISOString() };
  products.push(product);
  await writeProducts(products);
  res.status(201).json(product);
}
export async function updateProduct(req, res) {
  const errors = validateProductPayload(req.body, true);
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  const products = await readProducts();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });
  products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
  await writeProducts(products);
  res.json(products[index]);
}
export async function deleteProduct(req, res) {
  const products = await readProducts();
  const exists = products.some(p => p.id === req.params.id);
  if (!exists) return res.status(404).json({ message: 'Товар не найден' });
  await writeProducts(products.filter(p => p.id !== req.params.id));
  res.json({ message: 'Товар удалён' });
}
