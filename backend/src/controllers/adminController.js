import { getSafeUsers, updateUserRole, toSafeUser } from '../services/userStore.js';
export function getUsers(req, res) { res.json(getSafeUsers()); }
export function changeUserRole(req, res) {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ message: 'role должен быть admin или user' });
  const user = updateUserRole(req.params.id, role);
  if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  res.json(toSafeUser(user));
}
