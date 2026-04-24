# RBAC Products App

Полнофункциональное учебное веб-приложение: Express API + React/Vite frontend.

## Возможности

- CRUD товаров с JSON-файлом `backend/src/data/products.json`
- Регистрация и логин
- bcrypt-хеширование паролей
- JWT access + refresh tokens
- Refresh tokens в памяти сервера через `Set`
- RBAC: роли `admin` и `user`
- Защищённые admin routes
- Swagger UI: `http://localhost:5000/api-docs`

## Демо-админ

```txt
email: admin@example.com
password: admin123
```

## Запуск

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

API будет доступен на `http://localhost:5000`.

### Frontend

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:5173`.

## Основные endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Products

- `GET /api/products` public
- `GET /api/products/:id` public
- `POST /api/products` admin
- `PATCH /api/products/:id` admin
- `DELETE /api/products/:id` admin

### Admin

- `GET /api/admin/users` admin
- `PATCH /api/admin/users/:id/role` admin
