import { z } from "zod";

const fileSchema = z.instanceof(File, { message: "Geçerli bir dosya seçin" });

const imageFileSchema = fileSchema.refine(
  (file) => file.type.startsWith("image/"),
  { message: "Sadece resim dosyaları kabul edilir" }
).refine(
  (file) => file.size <= 5 * 1024 * 1024, // 5MB
  { message: "Dosya boyutu 5MB'dan büyük olamaz" }
);

export const createProductSchema = z.object({
  name: z.string()
    .min(1, "Ürün adı gereklidir")
    .min(2, "Ürün adı en az 2 karakter olmalıdır")
    .max(100, "Ürün adı en fazla 100 karakter olabilir"),
  
  description: z.string()
    .min(1, "Açıklama gereklidir")
    .min(10, "Açıklama en az 10 karakter olmalıdır")
    .max(2000, "Açıklama en fazla 2000 karakter olabilir"),
  
  shortDescription: z.string()
    .max(160, "Kısa açıklama en fazla 160 karakter olabilir")
    .optional(),
  
  category: z.string()
    .min(1, "Kategori seçimi gereklidir"),
  
  price: z.string()
    .min(1, "Fiyat gereklidir")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Fiyat geçerli bir sayı olmalı ve 0'dan büyük olmalıdır"
    }),
  
  salePrice: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "İndirimli fiyat geçerli bir sayı olmalıdır"
    }),
  
  stock: z.string()
    .min(1, "Stok miktarı gereklidir")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stok miktarı geçerli bir sayı olmalı ve 0 veya daha büyük olmalıdır"
    }),
  
  sku: z.string()
    .min(1, "SKU gereklidir")
    .min(3, "SKU en az 3 karakter olmalıdır")
    .max(50, "SKU en fazla 50 karakter olabilir"),
  
  lowStockThreshold: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Düşük stok eşiği geçerli bir sayı olmalıdır"
    }),
  
  status: z.enum(["draft", "active", "inactive"]),
  
  isFeatured: z.boolean().optional(),
  
  trackQuantity: z.boolean().optional(),
  
  tags: z.array(z.string()).optional(),
  
  images: z.union([
    imageFileSchema,
    z.array(imageFileSchema).min(1, "En az bir resim gereklidir").max(5, "En fazla 5 resim yükleyebilirsiniz")
  ]).optional(),
  
  variants: z.array(z.object({
    name: z.string().min(1, "Varyant adı gereklidir"),
    options: z.array(z.object({
      name: z.string().min(1, "Özellik adı gereklidir"),
      value: z.string().min(1, "Özellik değeri gereklidir")
    })).min(1, "En az bir özellik gereklidir"),
    sku: z.string().min(1, "Varyant SKU gereklidir"),
    price: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Varyant fiyatı geçerli bir sayı olmalıdır"
    }),
    stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Varyant stoku geçerli bir sayı olmalıdır"
    }),
    image: imageFileSchema.optional(),
    isDefault: z.boolean().optional()
  })).optional()
}).refine((data) => {
  // İndirimli fiyat normal fiyattan düşük olmalı
  if (data.salePrice && data.price) {
    return Number(data.salePrice) < Number(data.price);
  }
  return true;
}, {
  message: "İndirimli fiyat normal fiyattan düşük olmalıdır",
  path: ["salePrice"]
});

export const updateProductSchema = createProductSchema.partial().extend({
  _id: z.string().min(1, "Ürün ID gereklidir"),
  images: z.union([
    imageFileSchema,
    z.array(imageFileSchema).max(5, "En fazla 5 resim yükleyebilirsiniz"),
    z.array(z.string()).max(5, "En fazla 5 resim yükleyebilirsiniz"), // Existing image URLs
    z.string() // Single existing image URL
  ]).optional()
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Kategori adı gereklidir")
    .min(2, "Kategori adı en az 2 karakter olmalıdır")
    .max(50, "Kategori adı en fazla 50 karakter olabilir"),
  
  description: z.string()
    .min(1, "Açıklama gereklidir")
    .min(10, "Açıklama en az 10 karakter olmalıdır")
    .max(500, "Açıklama en fazla 500 karakter olabilir"),
  
  sortOrder: z.number()
    .min(0, "Sıralama 0 veya daha büyük olmalıdır")
    .max(999, "Sıralama 999'dan büyük olamaz")
    .optional()
    .default(0),
  
  isActive: z.boolean().optional().default(true),
  
  image: imageFileSchema.optional()
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  _id: z.string().min(1, "Kategori ID gereklidir"),
  image: z.union([
    imageFileSchema,
    z.string() // Existing image URL
  ]).optional()
});

// Customer schemas
export const updateCustomerSchema = z.object({
  _id: z.string().min(1, "Müşteri ID gereklidir"),
  
  firstName: z.string()
    .min(1, "Ad gereklidir")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .optional(),
  
  lastName: z.string()
    .min(1, "Soyad gereklidir")
    .max(50, "Soyad en fazla 50 karakter olabilir")
    .optional(),
  
  email: z.string()
    .email("Geçerli bir e-posta adresi girin")
    .optional(),
  
  phone: z.string()
    .min(10, "Telefon numarası en az 10 karakter olmalıdır")
    .max(15, "Telefon numarası en fazla 15 karakter olabilir")
    .optional(),
  
  isActive: z.boolean().optional(),
  
  role: z.enum(["user", "admin"]).optional()
});

// Review schemas
export const updateReviewSchema = z.object({
  _id: z.string().min(1, "Yorum ID gereklidir"),
  
  status: z.enum(["pending", "approved", "rejected"]),
  
  moderatorNote: z.string()
    .max(500, "Moderatör notu en fazla 500 karakter olabilir")
    .optional()
});

// Stock Management schemas
export const updateStockSchema = z.object({
  productId: z.string().min(1, "Ürün ID gereklidir"),
  
  stock: z.number()
    .min(0, "Stok miktarı 0 veya daha büyük olmalıdır")
    .max(99999, "Stok miktarı çok büyük"),
  
  lowStockThreshold: z.number()
    .min(0, "Düşük stok eşiği 0 veya daha büyük olmalıdır")
    .max(999, "Düşük stok eşiği çok büyük")
    .optional(),
  
  reason: z.string()
    .min(1, "Güncelleme nedeni gereklidir")
    .max(200, "Güncelleme nedeni en fazla 200 karakter olabilir"),
  
  trackQuantity: z.boolean().optional()
});

export const updateVariantStockSchema = z.object({
  productId: z.string().min(1, "Ürün ID gereklidir"),
  variantId: z.string().min(1, "Varyant ID gereklidir"),
  
  stock: z.number()
    .min(0, "Stok miktarı 0 veya daha büyük olmalıdır")
    .max(99999, "Stok miktarı çok büyük"),
  
  reason: z.string()
    .min(1, "Güncelleme nedeni gereklidir")
    .max(200, "Güncelleme nedeni en fazla 200 karakter olabilir")
});

// Newsletter schemas
export const newsletterSchema = z.object({
  email: z.string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi girin")
});

// Contact form schemas
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, "Ad gereklidir")
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(100, "Ad en fazla 100 karakter olabilir"),
  
  email: z.string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi girin"),
  
  subject: z.string()
    .min(1, "Konu gereklidir")
    .min(5, "Konu en az 5 karakter olmalıdır")
    .max(100, "Konu en fazla 100 karakter olabilir"),
  
  message: z.string()
    .min(1, "Mesaj gereklidir")
    .min(10, "Mesaj en az 10 karakter olmalıdır")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir")
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type UpdateVariantStockInput = z.infer<typeof updateVariantStockSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>; 