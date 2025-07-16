import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Upload dizinleri
const uploadDirs = [
  'uploads/',
  'uploads/profiles/',
  'uploads/products/',
  'uploads/categories/',
  'uploads/temp/'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Dosya boyut(bytes)
const fileSizeLimits = {
  profileImage: 5 * 1024 * 1024,    // 5MB
  productImage: 10 * 1024 * 1024,   // 10MB
  categoryImage: 5 * 1024 * 1024,   // 5MB
  document: 20 * 1024 * 1024        // 20MB
};

// Desteklenen dosya türleri
const allowedImageTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const sanitizeFileName = (originalName: string): string => {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
    
  return sanitized + ext;
};

const generateUniqueFileName = (originalName: string): string => {
  const sanitizedName = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(sanitizedName);
  const nameWithoutExt = path.basename(sanitizedName, ext);
  
  return `${nameWithoutExt}-${timestamp}-${random}${ext}`;
};


const profileImageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueName = generateUniqueFileName(file.originalname);
    cb(null, uniqueName);
  }
});

const productImageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueName = generateUniqueFileName(file.originalname);
    cb(null, uniqueName);
  }
});

const categoryImageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/categories/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueName = generateUniqueFileName(file.originalname);
    cb(null, uniqueName);
  }
});

const tempStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueName = generateUniqueFileName(file.originalname);
    cb(null, uniqueName);
  }
});

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya türü. Sadece JPEG, PNG, WebP ve GIF dosyaları yükleyebilirsiniz.'));
  }
};

const documentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya türü. Sadece PDF, Word ve metin dosyaları yükleyebilirsiniz.'));
  }
};

export const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: fileSizeLimits.profileImage,
    files: 1
  }
}).single('profileImage');

export const uploadProductImages = multer({
  storage: productImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: fileSizeLimits.productImage,
    files: 10 // Maksimum 10 resim
  }
}).array('productImages', 10);

export const uploadSingleProductImage = multer({
  storage: productImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: fileSizeLimits.productImage,
    files: 1
  }
}).single('productImage');

export const uploadCategoryImage = multer({
  storage: categoryImageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: fileSizeLimits.categoryImage,
    files: 1
  }
}).single('categoryImage');

export const uploadMultipleFiles = multer({
  storage: tempStorage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const isImage = allowedImageTypes.includes(file.mimetype);
    const isDocument = allowedDocumentTypes.includes(file.mimetype);
    
    if (isImage || isDocument) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü.'));
    }
  },
  limits: {
    fileSize: fileSizeLimits.document,
    files: 20
  }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]);

export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Dosya boyutu çok büyük',
          error: 'Maksimum dosya boyutu aşıldı'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Çok fazla dosya',
          error: 'Maksimum dosya sayısı aşıldı'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Beklenmeyen dosya alanı',
          error: 'Geçersiz dosya alanı'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Dosya yükleme hatası',
          error: error.message
        });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası',
      error: error.message
    });
  }

  next(error);
};

export const deleteFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // ENOENT = dosya zaten yok, bu bir hata değil
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const deleteFiles = async (filePaths: string[]): Promise<void> => {
  const deletePromises = filePaths.map(filePath => deleteFile(filePath));
  await Promise.allSettled(deletePromises);
};

export const cleanupTempFiles = (): void => {
  const tempDir = 'uploads/temp/';
  const maxAge = 24 * 60 * 60 * 1000; // 24 saat
  
  fs.readdir(tempDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        const now = Date.now();
        const fileAge = now - stats.mtime.getTime();
        
        if (fileAge > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Geçici dosya silinirken hata:', err);
          });
        }
      });
    });
  });
};


setInterval(cleanupTempFiles, 4 * 60 * 60 * 1000);

export const getFileInfo = (file: Express.Multer.File) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${file.filename}`
  };
};

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
} 