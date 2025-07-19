import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const productImagesDir = path.join(uploadDir, 'products');
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

const categoryImagesDir = path.join(uploadDir, 'categories');
if (!fs.existsSync(categoryImagesDir)) {
  fs.mkdirSync(categoryImagesDir, { recursive: true });
}

const profileImagesDir = path.join(uploadDir, 'profiles');
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'categoryImage') {
      cb(null, categoryImagesDir);
    } else if (file.fieldname === 'profileImage') {
      cb(null, profileImagesDir);
    } else {
      cb(null, productImagesDir);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    let prefix = 'product';
    if (file.fieldname === 'categoryImage') {
      prefix = 'category';
    } else if (file.fieldname === 'profileImage') {
      prefix = 'profile';
    }
    
    cb(null, `${prefix}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Geçersiz dosya türü: ${file.mimetype}. Sadece JPEG, PNG ve WebP formatındaki resimler kabul edilir`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
    fieldSize: 2 * 1024 * 1024
  },
  fileFilter: fileFilter
});

const handleUploadError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Çok fazla dosya yüklendi. Maksimum 20 dosya yükleyebilirsiniz.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Beklenmeyen dosya alanı.'
      });
    }
  }
  
  if (err.message && err.message.includes('Geçersiz dosya türü')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 20);
export const uploadCategoryImage = upload.single('categoryImage');
export const uploadProfileImage = upload.single('profileImage');

export const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 19 }
]);

export const uploadVariantImages = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'variant-0', maxCount: 1 },
  { name: 'variant-1', maxCount: 1 },
  { name: 'variant-2', maxCount: 1 },
  { name: 'variant-3', maxCount: 1 },
  { name: 'variant-4', maxCount: 1 },
  { name: 'variant-5', maxCount: 1 },
  { name: 'variant-6', maxCount: 1 },
  { name: 'variant-7', maxCount: 1 },
  { name: 'variant-8', maxCount: 1 },
  { name: 'variant-9', maxCount: 1 }
]);

export const uploadMultipleWithErrorHandling = [uploadMultiple, handleUploadError];
export const uploadSingleWithErrorHandling = [uploadSingle, handleUploadError];
export const uploadCategoryImageWithErrorHandling = [uploadCategoryImage, handleUploadError];
export const uploadProfileImageWithErrorHandling = [uploadProfileImage, handleUploadError];

export default upload; 