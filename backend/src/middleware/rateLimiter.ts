import rateLimit from 'express-rate-limit';


export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: (req) => {
    
    return process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1';
  },
});


export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, 
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, 
});


export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: {
    status: 'error',
    message: 'Too many password reset attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10, 
  message: {
    status: 'error',
    message: 'Too many upload attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 