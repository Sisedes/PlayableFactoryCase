import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import User from '../Classes/User/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'customer' | 'admin';
      }
    }
  }
}

export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Erişim token\'ı gereklidir'
      });
      return;
    }

    const decoded = verifyAccessToken(token);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz token veya deaktif kullanıcı'
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};

export const requireAdmin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Kimlik doğrulama gereklidir'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir'
    });
    return;
  }

  next();
};

export const requireCustomer = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Kimlik doğrulama gereklidir'
    });
    return;
  }

  if (req.user.role !== 'customer') {
    res.status(403).json({
      success: false,
      message: 'Bu işlem için müşteri hesabı gereklidir'
    });
    return;
  }

  next();
};

export const requireOwnership = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Kimlik doğrulama gereklidir'
    });
    return;
  }

  const { userId } = req.params;
  
  if (req.user.role === 'admin') {
    next();
    return;
  }

  if (req.user.userId !== userId) {
    res.status(403).json({
      success: false,
      message: 'Bu veriye erişim yetkiniz bulunmamaktadır'
    });
    return;
  }

  next();
};


export const requireEmailVerification = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Kimlik doğrulama gereklidir'
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    if (!user.authentication.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: 'Bu işlem için e-posta adresinizi doğrulamanız gereklidir',
        code: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'E-posta doğrulama kontrolü sırasında hata oluştu'
    });
  }
};

export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      next();
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }
    } catch (tokenError) {
      console.warn('Invalid optional token:', tokenError);
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); 
  }
}; 