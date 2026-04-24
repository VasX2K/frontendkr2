import { Router } from 'express';
import { changeUserRole, getUsers } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Администрирование пользователей
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Получить список пользователей без паролей
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Список пользователей }
 *       401: { description: Нет токена }
 *       403: { description: Недостаточно прав }
 */
adminRouter.get('/users', getUsers);
/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Изменить роль пользователя
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [admin, user], example: admin }
 *     responses:
 *       200: { description: Роль изменена }
 *       400: { description: Ошибка валидации }
 *       401: { description: Нет токена }
 *       403: { description: Недостаточно прав }
 *       404: { description: Не найден }
 */
adminRouter.patch('/users/:id/role', changeUserRole);
