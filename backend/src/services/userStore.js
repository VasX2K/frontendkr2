import bcrypt from 'bcrypt';

let users = [];
let nextId = 1;

export async function seedAdmin() {
  if (users.length) return;
  const passwordHash = await bcrypt.hash('admin123', 10);
  users.push({ id: String(nextId++), email: 'admin@example.com', passwordHash, role: 'admin', createdAt: new Date().toISOString() });
}

export function findUserByEmail(email) { return users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
export function findUserById(id) { return users.find(u => u.id === String(id)); }
export function getSafeUsers() { return users.map(({ passwordHash, ...safe }) => safe); }
export function toSafeUser(user) { if (!user) return null; const { passwordHash, ...safe } = user; return safe; }
export function createUser({ email, passwordHash, role = 'user' }) {
  const user = { id: String(nextId++), email, passwordHash, role, createdAt: new Date().toISOString() };
  users.push(user);
  return user;
}
export function updateUserRole(id, role) {
  const user = findUserById(id);
  if (!user) return null;
  user.role = role;
  return user;
}
