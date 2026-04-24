import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const refreshTokens = new Set();

export function signAccessToken(user) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: env.accessTokenExpires });
}
export function signRefreshToken(user) {
  const token = jwt.sign({ userId: user.id }, env.refreshSecret, { expiresIn: env.refreshTokenExpires });
  refreshTokens.add(token);
  return token;
}
export function createTokenPair(user) { return { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) }; }
export function verifyAccessToken(token) { return jwt.verify(token, env.jwtSecret); }
export function verifyRefreshToken(token) { return jwt.verify(token, env.refreshSecret); }
export function rotateRefreshToken(oldToken, user) { refreshTokens.delete(oldToken); return createTokenPair(user); }
