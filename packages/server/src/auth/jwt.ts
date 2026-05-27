import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env';

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

let env: ReturnType<typeof loadEnv>;

function getEnv() {
  if (!env) env = loadEnv();
  return env;
}

export function signToken(payload: JwtPayload): string {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const { JWT_SECRET } = getEnv();
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
