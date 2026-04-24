import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/products.json');
const seed = [
  { id: '1', title: 'Ноутбук Lenovo IdeaPad', price: 79999, description: 'Учебный демо-товар', createdAt: new Date().toISOString() },
  { id: '2', title: 'Мышь Logitech', price: 2999, description: 'Беспроводная мышь', createdAt: new Date().toISOString() }
];

async function ensureFile() {
  try { await fs.access(filePath); } catch { await fs.mkdir(path.dirname(filePath), { recursive: true }); await fs.writeFile(filePath, JSON.stringify(seed, null, 2)); }
}
export async function readProducts() { await ensureFile(); return JSON.parse(await fs.readFile(filePath, 'utf-8')); }
export async function writeProducts(products) { await fs.writeFile(filePath, JSON.stringify(products, null, 2)); }
export function validateProductPayload(body, partial = false) {
  const errors = [];
  if (!partial || body.title !== undefined) if (typeof body.title !== 'string' || !body.title.trim()) errors.push('title должен быть непустой строкой');
  if (!partial || body.price !== undefined) if (typeof body.price !== 'number' || Number.isNaN(body.price)) errors.push('price должен быть числом');
  return errors;
}
