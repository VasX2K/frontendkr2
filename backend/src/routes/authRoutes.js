import { Router } from 'express';
import { login, logout, me, refresh, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Регистрация, вход и токены
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, example: "1" }
 *         email: { type: string, example: "user@example.com" }
 *         role: { type: string, enum: [admin, user], example: user }
 *     AuthPayload:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, example: "user@example.com" }
 *         password: { type: string, example: "123456" }
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/AuthPayload'
 *               - type: object
 *                 properties:
 *                   role: { type: string, enum: [admin, user], example: user }
 *     responses:
 *       201: { description: Пользователь создан }
 *       400: { description: Ошибка валидации }
 */
authRouter.post('/register', register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthPayload' }
 *     responses:
 *       200: { description: Токены и пользователь }
 *       400: { description: Неверные данные }
 */
authRouter.post('/login', login);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Обновить пару токенов
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Новая пара токенов }
 *       401: { description: Refresh token недействителен }
 */
authRouter.post('/refresh', refresh);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Данные текущего пользователя
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Пользователь }
 *       401: { description: Нет доступа }
 */
authRouter.get('/me', requireAuth, me);
authRouter.post('/logout', logout);
