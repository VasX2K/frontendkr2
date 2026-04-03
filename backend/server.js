const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Секреты подписи
const ACCESS_SECRET = 'access_secret_key_2026';
const REFRESH_SECRET = 'refresh_secret_key_2026';

// Время жизни токенов
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// Хранилища данных (в памяти)
const users = [];
const products = [];
const refreshTokens = new Set();

// ==================== Генерация токенов ====================

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// ==================== Middleware ====================

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// ==================== Маршруты аутентификации ====================

// Регистрация (Гость)
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'email, password, first_name and last_name are required' });
  }

  const exists = users.some((u) => u.email === email);
  if (exists) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    id: nanoid(8),
    email,
    first_name,
    last_name,
    passwordHash,
    role: role || 'user',
  };

  users.push(user);

  res.status(201).json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });
});

// Вход (Гость)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.add(refreshToken);

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  });
});

// Обновление токенов (Гость)
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);

    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Ротация refresh-токена
    refreshTokens.delete(refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.add(newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Получение текущего пользователя (Пользователь)
app.get('/api/auth/me', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const userId = req.user.sub;
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });
});

// ==================== Маршруты пользователей (Администратор) ====================

// Получить список пользователей
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const usersList = users.map((u) => ({
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    role: u.role,
  }));
  res.json(usersList);
});

// Получить пользователя по id
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });
});

// Обновить информацию пользователя
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { first_name, last_name, role } = req.body;

  if (first_name) users[userIndex].first_name = first_name;
  if (last_name) users[userIndex].last_name = last_name;
  if (role) users[userIndex].role = role;

  res.json({
    id: users[userIndex].id,
    email: users[userIndex].email,
    first_name: users[userIndex].first_name,
    last_name: users[userIndex].last_name,
    role: users[userIndex].role,
  });
});

// Заблокировать пользователя (удалить)
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'User blocked successfully' });
});

// ==================== Маршруты товаров ====================

// Получить список товаров (Пользователь)
app.get('/api/products', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  res.json(products);
});

// Получить товар по id (Пользователь)
app.get('/api/products/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

// Создать товар (Продавец)
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const { title, category, description, price } = req.body;

  if (!title || !category || !description || price === undefined) {
    return res.status(400).json({ error: 'title, category, description and price are required' });
  }

  const product = {
    id: nanoid(8),
    title,
    category,
    description,
    price: Number(price),
  };

  products.push(product);
  res.status(201).json(product);
});

// Обновить товар (Продавец)
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { title, category, description, price } = req.body;

  if (title) products[productIndex].title = title;
  if (category) products[productIndex].category = category;
  if (description) products[productIndex].description = description;
  if (price !== undefined) products[productIndex].price = Number(price);

  res.json(products[productIndex]);
});

// Удалить товар (Администратор)
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const productIndex = products.findIndex((p) => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

// ==================== Предзаполненные данные ====================

// Администратор
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
users.push({
  id: 'admin001',
  email: 'vasx2k@mail.ru',
  first_name: 'Админ',
  last_name: 'Главный',
  passwordHash: adminPasswordHash,
  role: 'admin',
});

// Продавец
const sellerPasswordHash = bcrypt.hashSync('seller123', 10);
users.push({
  id: 'seller01',
  email: 'seller@test.com',
  first_name: 'Продавец',
  last_name: 'Товаров',
  passwordHash: sellerPasswordHash,
  role: 'seller',
});

// Обычный пользователь
const userPasswordHash = bcrypt.hashSync('user123', 10);
users.push({
  id: 'user001',
  email: 'user@test.com',
  first_name: 'Пользователь',
  last_name: 'Простой',
  passwordHash: userPasswordHash,
  role: 'user',
});

// Товары
products.push(
  { id: 'prod001', title: 'iPhone 15 Pro', category: 'Смартфоны', description: 'Флагманский смартфон Apple с чипом A17 Pro, титановым корпусом и улучшенной камерой', price: 129990 },
  { id: 'prod002', title: 'Samsung Galaxy S24', category: 'Смартфоны', description: 'Мощный Android-смартфон с AI-функциями и AMOLED-дисплеем', price: 89990 },
  { id: 'prod003', title: 'MacBook Air M3', category: 'Ноутбуки', description: 'Ультратонкий ноутбук с чипом Apple M3, 16 ГБ ОЗУ, 512 ГБ SSD', price: 159990 },
  { id: 'prod004', title: 'Sony WH-1000XM5', category: 'Наушники', description: 'Беспроводные наушники с лучшим шумоподавлением в классе', price: 34990 },
  { id: 'prod005', title: 'iPad Air M2', category: 'Планшеты', description: 'Производительный планшет с чипом M2 и дисплеем Liquid Retina', price: 74990 },
  { id: 'prod006', title: 'PlayStation 5 Slim', category: 'Игровые консоли', description: 'Игровая консоль нового поколения с поддержкой 4K и SSD', price: 54990 },
  { id: 'prod007', title: 'Xiaomi Robot Vacuum', category: 'Умный дом', description: 'Робот-пылесос с навигацией LiDAR и влажной уборкой', price: 29990 },
  { id: 'prod008', title: 'Logitech MX Master 3S', category: 'Аксессуары', description: 'Эргономичная беспроводная мышь для продуктивной работы', price: 9990 },
  { id: 'prod009', title: 'Dell XPS 15', category: 'Ноутбуки', description: 'Премиальный ноутбук с OLED-дисплеем и Intel Core i7', price: 179990 },
  { id: 'prod010', title: 'AirPods Pro 2', category: 'Наушники', description: 'TWS-наушники с адаптивным шумоподавлением и пространственным звуком', price: 24990 }
);

// ==================== Запуск сервера ====================

app.listen(PORT, () => {
  console.log(`Backend сервер запущен на http://localhost:${PORT}`);
});
