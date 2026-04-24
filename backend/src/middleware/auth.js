import { verifyAccessToken } from '../services/tokenService.js';
import { findUserById } from '../services/userStore.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Нет access token' });
  try {
    const payload = verifyAccessToken(header.split(' ')[1]);
    const user = findUserById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Невалидный или истёкший access token' });
  }
}
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Требуется авторизация' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Недостаточно прав' });
    next();
  };
}
