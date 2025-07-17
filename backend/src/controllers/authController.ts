import { Request, Response } from 'express';
import User from '../Classes/User/userModel';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService';
import crypto from 'crypto';

/**
 * @desc    
 * @route   post /api/auth/register
 * @access  
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi ile zaten bir hesap mevcut'
      });
      return;
    }

    const user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName,
        phone
      }
    });

    // E-posta doğrulama token'ı 
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken, firstName);
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);

    }

    // JWT token
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 gün
    });

    res.status(201).json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu. E-posta adresinizi doğrulamak için gönderilen linke tıklayın.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          role: user.role,
          isEmailVerified: user.authentication.isEmailVerified
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   post /api/auth/login
 * @access  
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +authentication.loginAttempts +authentication.lockUntil');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya parola'
      });
      return;
    }

    if (user.isLocked) {
      res.status(423).json({
        success: false,
        message: 'Hesabınız çok fazla başarısız giriş denemesi nedeniyle geçici olarak kilitlenmiştir'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Hesabınız devre dışı bırakılmıştır'
      });
      return;
    }

    // E-posta doğrulama kontrolü
    if (!user.authentication.isEmailVerified) {
      res.status(401).json({
        success: false,
        message: 'E-posta adresinizi doğrulamanız gerekiyor. E-posta kutunuzu kontrol edin.',
        code: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.increaseLoginAttempts();
      
      res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya parola'
      });
      return;
    }

    if (user.authentication.loginAttempts && user.authentication.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    user.authentication.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 gün
    });

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          role: user.role,
          isEmailVerified: user.authentication.isEmailVerified
        },
        accessToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc     
 * @route   post /api/auth/logout
 * @access  
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Çıkış sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/auth/refresh
 * @access  
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.cookies;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Refresh token bulunamadı'
      });
      return;
    }


    const decoded = verifyRefreshToken(token);
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı'
      });
      return;
    }

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Geçersiz refresh token'
    });
  }
};

/**
 * @desc    Eposta doğrulama
 * @route   get /api/auth/verify-email/:token
 * @access  
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      'authentication.emailVerificationToken': hashedToken,
      'authentication.emailVerificationExpires': { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş doğrulama linki'
      });
      return;
    }

    user.authentication.isEmailVerified = true;
    user.authentication.emailVerificationToken = '';
    user.authentication.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'E-posta adresiniz başarıyla doğrulandı'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'E-posta doğrulama sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/auth/forgot-password
 * @access  
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(200).json({
        success: true,
        message: 'Eğer bu e-posta adresi sistemimizde kayıtlıysa, parola sıfırlama linki gönderilmiştir'
      });
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken, user.profile.firstName);
    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      user.authentication.passwordResetToken = '';
      user.authentication.passwordResetExpires = null;
      await user.save();

      res.status(500).json({
        success: false,
        message: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Parola sıfırlama linki e-posta adresinize gönderildi'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Parola sıfırlama isteği sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/auth/reset-password/:token
 * @access  
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

   
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      'authentication.passwordResetToken': hashedToken,
      'authentication.passwordResetExpires': { $gt: new Date() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş parola sıfırlama linki'
      });
      return;
    }

    user.password = password;
    user.authentication.passwordResetToken = '';
    user.authentication.passwordResetExpires = null;
    user.authentication.loginAttempts = 0;
    user.authentication.lockUntil = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Parolanız başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Parola sıfırlama sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/auth/me
 * @access  
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.userId)
      .populate('addresses')
      .select('-password -authentication.emailVerificationToken -authentication.passwordResetToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı bilgileri alınamadı'
    });
  }
};

/**
 * @desc    
 * @route   post /api/auth/resend-verification-by-email
 * @access  
 */
export const resendVerificationByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir'
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı'
      });
      return;
    }

    if (user.authentication.isEmailVerified) {
      res.status(400).json({
        success: false,
        message: 'E-posta adresiniz zaten doğrulanmış'
      });
      return;
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    try {
      const { sendVerificationEmail } = require('../utils/emailService');
      await sendVerificationEmail(user.email, verificationToken, user.profile.firstName);
      
      res.status(200).json({
        success: true,
        message: 'Doğrulama e-postası tekrar gönderildi. E-posta kutunuzu kontrol edin.'
      });
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      res.status(500).json({
        success: false,
        message: 'E-posta gönderilirken hata oluştu. Lütfen tekrar deneyin.'
      });
    }
  } catch (error) {
    console.error('Resend verification by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Doğrulama e-postası gönderilirken hata oluştu'
    });
  }
}; 