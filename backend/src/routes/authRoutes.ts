import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController';
import {
  authenticateToken,
  requireEmailVerification,
  optionalAuth
} from '../middleware/authMiddleware';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
} from '../middleware/validationMiddleware';
import { uploadProfileImage, handleUploadError } from '../config/multer';

const router = express.Router();

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada maksimum 5 deneme
  message: {
    success: false,
    message: 'Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // 1 saatte maksimum 3 deneme
  message: {
    success: false,
    message: 'Çok fazla parola sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // 1 saatte maksimum 3 kayıt
  message: {
    success: false,
    message: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/auth/register
 * @desc    Kullanıcı kaydı
 * @access  Public
 */
router.post('/register', 
  registerLimiter,
  validateRegister,
  handleValidationErrors,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Kullanıcı çıkışı
 * @access  Private
 */
router.post('/logout',
  authenticateToken,
  logout
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Access token yenileme
 * @access  Public (refresh token gerekli)
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    E-posta doğrulama
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Parola sıfırlama isteği
 * @access  Public
 */
router.post('/forgot-password',
  forgotPasswordLimiter,
  validateForgotPassword,
  handleValidationErrors,
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Parola sıfırlama
 * @access  Public
 */
router.post('/reset-password/:token',
  validateResetPassword,
  handleValidationErrors,
  resetPassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  getMe
);

/**
 * @route   POST /api/auth/upload-profile-image
 * @desc    Profil resmi yükleme
 * @access  Private
 */
router.post('/upload-profile-image',
  authenticateToken,
  requireEmailVerification,
  uploadProfileImage,
  handleUploadError,
  async (req: express.Request, res: express.Response):Promise<void> => {
    try {
      if (!req.file) {
          res.status(400).json({
          success: false,
          message: 'Dosya yüklenmedi'
        });
      }

      const fileUrl = `/uploads/profiles/${req.file?.filename}`;
      
      res.status(200).json({
        success: true,
        message: 'Profil resmi başarıyla yüklendi',
        data: {
          filename: req.file?.filename,
          originalName: req.file?.originalname,
          size: req.file?.size,
          url: fileUrl
        }
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
        res.status(500).json({
        success: false,
        message: 'Profil resmi yüklenirken hata oluştu'
      });
    }
  }
);

/**
 * @route   get /api/auth/check-auth
 * @desc    
 * @access  
 */
router.get('/check-auth',
  optionalAuth,
  (req, res) => {
    res.status(200).json({
      success: true,
      isAuthenticated: !!req.user,
      user: req.user || null
    });
  }
);

/**
 * @route   post /api/auth/resend-verification
 * @desc    
 * @access  
 */
router.post('/resend-verification',
  authLimiter,
  authenticateToken,
  async (req, res):Promise<void> => {
    try {
      const User = (await import('../Classes/User/userModel')).default;
      const { sendVerificationEmail } = await import('../utils/emailService');
      
      const user = await User.findById(req.user!.userId);
      if (!user) {
          res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
        });
      }

      if (user?.authentication.isEmailVerified) {
          res.status(400).json({
          success: false,
          message: 'E-posta adresi zaten doğrulanmış'
        });
      }

      const verificationToken = (user as any).createEmailVerificationToken();
      await user?.save();

      try {
        if (!user?.email) {
          throw new Error('Kullanıcının e-posta adresi bulunamadı');
        }
        await sendVerificationEmail(
          user.email, 
          verificationToken, 
          user?.profile.firstName
        );
        res.status(200).json({
          success: true,
          message: 'Doğrulama e-postası yeniden gönderildi'
        });
      } catch (emailError) {
        console.error('Verification email error:', emailError);
        res.status(500).json({
          success: false,
          message: 'E-posta gönderilemedi'
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Doğrulama e-postası gönderilirken hata oluştu'
      });
    }
  }
);

export default router; 