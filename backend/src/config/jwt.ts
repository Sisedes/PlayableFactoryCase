import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

const jwtConfig: JWTConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
};

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: 'e-commerce-api',
    audience: 'e-commerce-app',
  } as any);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: 'e-commerce-api',
    audience: 'e-commerce-app',
  } as any);
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.secret, {
    issuer: 'e-commerce-api',
    audience: 'e-commerce-app',
  }) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret, {
    issuer: 'e-commerce-api',
    audience: 'e-commerce-app',
  }) as JWTPayload;
};

export const generateTokenPair = (payload: JWTPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export { JWTPayload, JWTConfig };
export default jwtConfig; 