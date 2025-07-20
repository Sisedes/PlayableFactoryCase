import rateLimit from 'express-rate-limit';
import { Request } from 'express';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const isLocalRequest = (req: Request): boolean => {
  const ip = req.ip || req.connection.remoteAddress;
  return ip === '127.0.0.1' || ip === '::1' || (typeof ip === 'string' && ip.includes('192.168.'));
};

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? '5000' : '5000')), // Canlı sunucu için artırıldı
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: (req) => {
    // Canlı sunucuda daha esnek davran
    if (isProduction) {
      return false; // Production'da skip etme
    }
    return isDevelopment && isLocalRequest(req);
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: isDevelopment ? 100 : 50, // Production için artırıldı
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
  skip: (req) => {
    if (isProduction) {
      return false;
    }
    return isDevelopment && isLocalRequest(req);
  },
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: isDevelopment ? 50 : 20, // Production için artırıldı
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isProduction) {
      return false;
    }
    return isDevelopment && isLocalRequest(req);
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: isDevelopment ? 100 : 50, // Production için artırıldı
  message: {
    status: 'error',
    message: 'Too many upload attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isProduction) {
      return false;
    }
    return isDevelopment && isLocalRequest(req);
  },
}); 