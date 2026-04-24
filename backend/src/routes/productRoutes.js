import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const productRouter = Router();
const adminOnly = [requireAuth, requireRole('admin')];

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: CRUD товаров
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, example: "1" }
 *         title: { type: string, example: "Ноутбук" }
 *         price: { type: number, example: 79999 }
 *         description: { type: string, example: "Описание" }
 *     ProductInput:
 *       type: object
 *       required: [title, price]
 *       properties:
 *         title: { type: string, example: "Клавиатура" }
 *         price: { type: number, example: 4999 }
 *         description: { type: string, example: "Механическая" }
 */
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Получить все товары
 *     responses:
 *       200: { description: Список товаров }
 *   post:
 *     tags: [Products]
 *     summary: Создать товар
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201: { description: Товар создан }
 *       400: { description: Ошибка валидации }
 *       401: { description: Нет токена }
 *       403: { description: Недостаточно прав }
 */
productRouter.get('/', getProducts);
productRouter.post('/', ...adminOnly, createProduct);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Получить товар по id
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Товар }
 *       404: { description: Не найден }
 *   patch:
 *     tags: [Products]
 *     summary: Обновить товар
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200: { description: Обновлён }
 *       400: { description: Ошибка валидации }
 *       401: { description: Нет токена }
 *       403: { description: Недостаточно прав }
 *       404: { description: Не найден }
 *   delete:
 *     tags: [Products]
 *     summary: Удалить товар
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: Удалён }
 *       401: { description: Нет токена }
 *       403: { description: Недостаточно прав }
 *       404: { description: Не найден }
 */
productRouter.get('/:id', getProduct);
productRouter.patch('/:id', ...adminOnly, updateProduct);
productRouter.delete('/:id', ...adminOnly, deleteProduct);
