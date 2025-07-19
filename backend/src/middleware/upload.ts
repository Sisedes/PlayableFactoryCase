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

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, productImagesDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece JPEG, PNG ve WebP formatındaki resimler kabul edilir'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 10 
  },
  fileFilter: fileFilter
});

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);
export const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 9 }
]);

export const uploadVariantImages = upload.fields([
  { name: 'images', maxCount: 9 },
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

export default upload; 