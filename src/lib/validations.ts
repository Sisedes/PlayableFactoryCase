import { z } from "zod";

// Auth Validations
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .max(100, "Şifre çok uzun"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harf içerebilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harf içerebilir"),
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .max(100, "Şifre çok uzun")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
    ),
  confirmPassword: z
    .string()
    .min(1, "Şifre onayı gereklidir"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^(\+90|90)?[1-9][0-9]{9}$/.test(phone.replace(/\s/g, ""));
    }, "Geçerli bir telefon numarası giriniz"),
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, "Kullanım şartlarını kabul etmelisiniz"),
  newsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .max(100, "Şifre çok uzun")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
    ),
  confirmPassword: z
    .string()
    .min(1, "Şifre onayı gereklidir"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

// Profile Validations
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harf içerebilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harf içerebilir"),
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^(\+90|90)?[1-9][0-9]{9}$/.test(phone.replace(/\s/g, ""));
    }, "Geçerli bir telefon numarası giriniz"),
  currentPassword: z
    .string()
    .optional(),
  newPassword: z
    .string()
    .optional(),
  confirmPassword: z
    .string()
    .optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Şifre değiştirmek için mevcut şifrenizi girmelisiniz",
  path: ["currentPassword"],
});

// Address Validation
export const addressSchema = z.object({
  type: z.enum(["shipping", "billing"], {
    message: "Adres tipi seçiniz",
  }),
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad çok uzun"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad çok uzun"),
  company: z
    .string()
    .max(100, "Şirket adı çok uzun")
    .optional(),
  address1: z
    .string()
    .min(10, "Adres en az 10 karakter olmalıdır")
    .max(200, "Adres çok uzun"),
  address2: z
    .string()
    .max(200, "Adres çok uzun")
    .optional(),
  city: z
    .string()
    .min(2, "Şehir adı en az 2 karakter olmalıdır")
    .max(50, "Şehir adı çok uzun"),
  state: z
    .string()
    .min(2, "İl/Bölge en az 2 karakter olmalıdır")
    .max(50, "İl/Bölge çok uzun"),
  postalCode: z
    .string()
    .min(5, "Posta kodu en az 5 karakter olmalıdır")
    .max(10, "Posta kodu çok uzun")
    .regex(/^[0-9]+$/, "Posta kodu sadece rakam içerebilir"),
  country: z
    .string()
    .min(2, "Ülke seçiniz")
    .max(50, "Ülke adı çok uzun"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^(\+90|90)?[1-9][0-9]{9}$/.test(phone.replace(/\s/g, ""));
    }, "Geçerli bir telefon numarası giriniz"),
  isDefault: z.boolean().optional(),
});

// Contact Form Validation
export const contactSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harf içerebilir"),
  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad çok uzun")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Soyad sadece harf içerebilir"),
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^(\+90|90)?[1-9][0-9]{9}$/.test(phone.replace(/\s/g, ""));
    }, "Geçerli bir telefon numarası giriniz"),
  subject: z
    .string()
    .min(5, "Konu en az 5 karakter olmalıdır")
    .max(100, "Konu çok uzun"),
  message: z
    .string()
    .min(20, "Mesaj en az 20 karakter olmalıdır")
    .max(1000, "Mesaj çok uzun"),
});

// Checkout Validation
export const checkoutSchema = z.object({
  shippingAddress: addressSchema.omit({ type: true }),
  billingAddress: addressSchema.omit({ type: true }).optional(),
  sameAsShipping: z.boolean(),
  paymentMethod: z
    .string()
    .min(1, "Ödeme yöntemi seçiniz"),
  notes: z
    .string()
    .max(500, "Not çok uzun")
    .optional(),
}).refine((data) => {
  if (!data.sameAsShipping && !data.billingAddress) {
    return false;
  }
  return true;
}, {
  message: "Fatura adresi gereklidir",
  path: ["billingAddress"],
});

// Product Review Validation
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Puan seçiniz")
    .max(5, "Geçersiz puan")
    .int("Puan tam sayı olmalıdır"),
  title: z
    .string()
    .max(100, "Başlık çok uzun")
    .optional(),
  comment: z
    .string()
    .min(10, "Yorum en az 10 karakter olmalıdır")
    .max(1000, "Yorum çok uzun"),
});

// Newsletter Subscription Validation
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
});

// Search Validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Arama terimi giriniz")
    .max(100, "Arama terimi çok uzun")
    .optional(),
  categoryId: z
    .string()
    .optional(),
  priceMin: z
    .number()
    .min(0, "Minimum fiyat 0'dan küçük olamaz")
    .optional(),
  priceMax: z
    .number()
    .min(0, "Maksimum fiyat 0'dan küçük olamaz")
    .optional(),
  rating: z
    .number()
    .min(1)
    .max(5)
    .optional(),
  inStock: z
    .boolean()
    .optional(),
  featured: z
    .boolean()
    .optional(),
  sortBy: z
    .enum(["name", "price", "rating", "created", "popular"])
    .optional(),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional(),
}).refine((data) => {
  if (data.priceMin && data.priceMax && data.priceMin > data.priceMax) {
    return false;
  }
  return true;
}, {
  message: "Minimum fiyat maksimum fiyattan büyük olamaz",
  path: ["priceMax"],
});

// Admin Product Validation
export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Ürün adı en az 2 karakter olmalıdır")
    .max(200, "Ürün adı çok uzun"),
  description: z
    .string()
    .min(10, "Açıklama en az 10 karakter olmalıdır")
    .max(5000, "Açıklama çok uzun"),
  price: z
    .number()
    .min(0.01, "Fiyat 0'dan büyük olmalıdır")
    .max(999999.99, "Fiyat çok yüksek"),
  discountedPrice: z
    .number()
    .min(0, "İndirimli fiyat 0'dan küçük olamaz")
    .optional(),
  categoryId: z
    .string()
    .min(1, "Kategori seçiniz"),
  stock: z
    .number()
    .min(0, "Stok 0'dan küçük olamaz")
    .int("Stok tam sayı olmalıdır"),
  sku: z
    .string()
    .min(1, "SKU gereklidir")
    .max(50, "SKU çok uzun")
    .regex(/^[A-Z0-9-]+$/, "SKU sadece büyük harf, rakam ve tire içerebilir"),
  tags: z
    .array(z.string().max(30, "Etiket çok uzun"))
    .max(10, "En fazla 10 etiket ekleyebilirsiniz")
    .optional(),
  featured: z
    .boolean()
    .optional(),
  active: z
    .boolean()
    .optional(),
}).refine((data) => {
  if (data.discountedPrice && data.discountedPrice >= data.price) {
    return false;
  }
  return true;
}, {
  message: "İndirimli fiyat normal fiyattan düşük olmalıdır",
  path: ["discountedPrice"],
});

// Admin Category Validation
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Kategori adı en az 2 karakter olmalıdır")
    .max(100, "Kategori adı çok uzun"),
  slug: z
    .string()
    .min(2, "Slug en az 2 karakter olmalıdır")
    .max(100, "Slug çok uzun")
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  description: z
    .string()
    .max(500, "Açıklama çok uzun")
    .optional(),
  parentId: z
    .string()
    .optional(),
  order: z
    .number()
    .min(0, "Sıra 0'dan küçük olamaz")
    .int("Sıra tam sayı olmalıdır")
    .optional(),
  active: z
    .boolean()
    .optional(),
});

// Export all schema types for use with React Hook Form
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>; 