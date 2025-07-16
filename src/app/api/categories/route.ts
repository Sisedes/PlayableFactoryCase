import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export async function GET(request: NextRequest) {
  try {
    // Backend'den kategorileri fetch et
    const response = await fetch(`${BACKEND_URL}/api/categories`, {
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
      console.error('Backend response error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Kategoriler yüklenirken hata oluştu' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Response headers ekle
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    headers.set('X-API-Source', 'NextJS-Proxy');

    return NextResponse.json(data, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Categories API route error:', error);
    
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