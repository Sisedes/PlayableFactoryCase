import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * @desc    Get all products with filtering, pagination, search
 * @route   GET /api/products
 * @access  Public
 */
export async function GET(request: NextRequest) {
  try {
    // URL search params'ları backend'e forward et
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Backend'den ürünleri fetch et
    const backendUrl = queryString 
      ? `${BACKEND_URL}/api/products?${queryString}`
      : `${BACKEND_URL}/api/products`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend/1.0',
      },
      next: {
        revalidate: 30, // 30 saniye cache (ürünler sık değişebilir)
      },
    });

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ürünler yüklenirken hata oluştu' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Response headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    headers.set('X-API-Source', 'NextJS-Proxy');
    headers.set('X-Total-Products', data.total?.toString() || '0');

    return NextResponse.json(data, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Products API route error:', error);
    
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