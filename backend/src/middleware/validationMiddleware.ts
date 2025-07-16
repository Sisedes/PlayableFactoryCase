import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation hatalarını kontrol eden middleware
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined
    }));

    res.status(400).json({
      success: false,
      message: 'Doğrulama hatası',
      errors: errorMessages
    });
    return;
  }

  next();
};

/**
 * Kullanıcı kayıt doğrulamaları
 */
export const validateRegister: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('E-posta adresi 254 karakterden uzun olamaz'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Parola en az 6 karakter olmalıdır')
    .isLength({ max: 128 })
    .withMessage('Parola 128 karakterden uzun olamaz'),

  body('firstName')
    .notEmpty()
    .withMessage('Ad gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Ad sadece harfler içerebilir'),

  body('lastName')
    .notEmpty()
    .withMessage('Soyad gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Soyad sadece harfler içerebilir'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; 
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      return phoneRegex.test(value);
    })
    .withMessage('Telefon numarası geçerli formatta olmalıdır')
];

/**
 * Kullanıcı giriş doğrulamaları
 */
export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Parola gereklidir')
    .isLength({ min: 1 })
    .withMessage('Parola boş olamaz')
];

/**
 * Parola sıfırlama isteği doğrulamaları
 */
export const validateForgotPassword: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail()
];

/**
 * Parola sıfırlama doğrulamaları
 */
export const validateResetPassword: ValidationChain[] = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Parola en az 6 karakter olmalıdır')
    .isLength({ max: 128 })
    .withMessage('Parola 128 karakterden uzun olamaz'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Parola onayı eşleşmiyor');
      }
      return true;
    })
];

/**
 * Profil güncelleme doğrulamaları
 */
export const validateUpdateProfile: ValidationChain[] = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Ad sadece harfler içerebilir'),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Soyad sadece harfler içerebilir'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true;
      
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      return phoneRegex.test(value);
    })
    .withMessage('Telefon numarası geçerli formatta olmalıdır')
];

/**
 * Parola değiştirme doğrulamaları
 */
export const validateChangePassword: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut parola gereklidir'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni parola en az 6 karakter olmalıdır')
    .isLength({ max: 128 })
    .withMessage('Yeni parola 128 karakterden uzun olamaz'),

  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Yeni parola onayı eşleşmiyor');
      }
      return true;
    })
];

/**
 * Adres ekleme/güncelleme doğrulamaları
 */
export const validateAddress: ValidationChain[] = [
  body('type')
    .isIn(['home', 'work', 'other'])
    .withMessage('Adres tipi home, work veya other olmalıdır'),

  body('title')
    .notEmpty()
    .withMessage('Adres başlığı gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Adres başlığı 2-50 karakter arasında olmalıdır'),

  body('firstName')
    .notEmpty()
    .withMessage('Ad gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Ad 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Ad sadece harfler içerebilir'),

  body('lastName')
    .notEmpty()
    .withMessage('Soyad gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Soyad 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Soyad sadece harfler içerebilir'),

  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Şirket adı 100 karakterden uzun olamaz'),

  body('address1')
    .notEmpty()
    .withMessage('Adres satır 1 gereklidir')
    .isLength({ min: 10, max: 200 })
    .withMessage('Adres satır 1 10-200 karakter arasında olmalıdır'),

  body('address2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Adres satır 2 200 karakterden uzun olamaz'),

  body('city')
    .notEmpty()
    .withMessage('Şehir gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Şehir 2-50 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Şehir sadece harfler içerebilir'),

  body('state')
    .notEmpty()
    .withMessage('İl/Bölge gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('İl/Bölge 2-50 karakter arasında olmalıdır'),

  body('postalCode')
    .notEmpty()
    .withMessage('Posta kodu gereklidir')
    .matches(/^\d{5}$/)
    .withMessage('Posta kodu 5 haneli olmalıdır'),

  body('country')
    .notEmpty()
    .withMessage('Ülke gereklidir')
    .isLength({ min: 2, max: 50 })
    .withMessage('Ülke 2-50 karakter arasında olmalıdır'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; 
      const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
      return phoneRegex.test(value);
    })
    .withMessage('Telefon numarası geçerli formatta olmalıdır'),

  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault boolean değer olmalıdır')
];

/**
 * İletişim formu doğrulamaları
 */
export const validateContact: ValidationChain[] = [
  body('name')
    .notEmpty()
    .withMessage('Ad Soyad gereklidir')
    .isLength({ min: 3, max: 100 })
    .withMessage('Ad Soyad 3-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('Ad Soyad sadece harfler içerebilir'),

  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),

  body('subject')
    .notEmpty()
    .withMessage('Konu gereklidir')
    .isLength({ min: 5, max: 200 })
    .withMessage('Konu 5-200 karakter arasında olmalıdır'),

  body('message')
    .notEmpty()
    .withMessage('Mesaj gereklidir')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mesaj 10-2000 karakter arasında olmalıdır')
];

/**
 * Ürün değerlendirmesi doğrulamaları
 */
export const validateReview: ValidationChain[] = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Değerlendirme 1-5 arasında olmalıdır'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Başlık 3-100 karakter arasında olmalıdır'),

  body('comment')
    .notEmpty()
    .withMessage('Yorum gereklidir')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Yorum 10-1000 karakter arasında olmalıdır')
];

/**
 * Arama doğrulamaları
 */
export const validateSearch: ValidationChain[] = [
  body('query')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Arama terimi 2-100 karakter arasında olmalıdır')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_]+$/)
    .withMessage('Arama terimi geçersiz karakterler içeriyor'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Geçerli bir kategori ID\'si giriniz'),

  body('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum fiyat 0\'dan büyük olmalıdır'),

  body('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maksimum fiyat 0\'dan büyük olmalıdır')
    .custom((value, { req }) => {
      if (req.body.minPrice && value < req.body.minPrice) {
        throw new Error('Maksimum fiyat minimum fiyattan büyük olmalıdır');
      }
      return true;
    })
]; 