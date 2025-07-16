import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * @desc    Get popular products
 * @route   GET /api/products/popular
 * @access  Public
 */
export async function GET(request: NextRequest) {
  try {
    // Query params (limit)
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '8';

    // Backend'den popüler ürünleri fetch et
    const response = await fetch(`${BACKEND_URL}/api/products/popular?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend/1.0',
      },
      next: {
        revalidate: 300, // 5 dakika cache (popüler ürünler sık değişmez)
      },
    });

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Popüler ürünler yüklenirken hata oluştu' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Response headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    headers.set('X-API-Source', 'NextJS-Proxy');
    headers.set('X-Product-Type', 'popular');

    return NextResponse.json(data, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Popular products API route error:', error);
    
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