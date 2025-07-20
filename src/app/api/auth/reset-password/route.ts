import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Doğrulama şeması
const resetPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Parola en az 6 karakter olmalıdır'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Giriş verilerini doğrula
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz veri formatı' 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Backend API'ye istek gönder
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Parolanız başarıyla güncellendi',
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Parola güncellenirken bir hata oluştu' 
        },
        { status: response.status }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Sunucu hatası oluştu' 
      },
      { status: 500 }
    );
  }
} 