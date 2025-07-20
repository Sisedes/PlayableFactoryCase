import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Doğrulama şeması
const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Giriş verilerini doğrula
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz e-posta adresi' 
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Backend API'ye istek gönder
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Parola sıfırlama kodu e-posta adresinize gönderildi',
        data: result.data
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message || 'Parola sıfırlama kodu gönderilemedi' 
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