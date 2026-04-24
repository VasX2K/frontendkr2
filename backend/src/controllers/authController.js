import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserById, toSafeUser } from '../services/userStore.js';
import { createTokenPair, refreshTokens, rotateRefreshToken, verifyRefreshToken } from '../services/tokenService.js';

export async function register(req, res) {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email и password обязательны' });
  if (findUserByEmail(email)) return res.status(400).json({ message: 'Email уже зарегистрирован' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ email, passwordHash, role: role === 'admin' ? 'admin' : 'user' });
  const tokens = createTokenPair(user);
  res.status(201).json({ ...tokens, user: toSafeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = findUserByEmail(email || '');
  if (!user) return res.status(400).json({ message: 'Неверный email или пароль' });
  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Неверный email или пароль' });
  res.json({ ...createTokenPair(user), user: toSafeUser(user) });
}

export function refresh(req, res) {
  const token = req.body.refreshToken || req.headers['x-refresh-token'];
  if (!token) return res.status(401).json({ message: 'Нет refresh token' });
  if (!refreshTokens.has(token)) return res.status(401).json({ message: 'Refresh token недействителен' });
  try {
    const payload = verifyRefreshToken(token);
    const user = findUserById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
    const tokens = rotateRefreshToken(token, user);
    res.json({ ...tokens, user: toSafeUser(user) });
  } catch {
    refreshTokens.delete(token);
    res.status(401).json({ message: 'Refresh token истёк или невалиден' });
  }
}

export function me(req, res) { res.json({ user: req.user }); }
export function logout(req, res) {
  const token = req.body.refreshToken || req.headers['x-refresh-token'];
  if (token) refreshTokens.delete(token);
  res.json({ message: 'Вы вышли из системы' });
}
