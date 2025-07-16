import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * @desc    Get product by ID
 * @route   GET /api/products/[id]
 * @access  Public
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // ID validation
    if (!id || typeof id !== 'string' || id.length !== 24) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz ürün ID' 
        },
        { status: 400 }
      );
    }

    // Backend'den ürün detayını fetch et
    const response = await fetch(`${BACKEND_URL}/api/products/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend/1.0',
      },
      next: {
        revalidate: 60, // 1 dakika cache
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Ürün bulunamadı' 
          },
          { status: 404 }
        );
      }

      console.error('Backend response error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ürün detayı yüklenirken hata oluştu' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Response headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    headers.set('X-API-Source', 'NextJS-Proxy');
    headers.set('X-Product-ID', id);

    return NextResponse.json(data, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Product by ID API route error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Sunucu hatası oluştu',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 