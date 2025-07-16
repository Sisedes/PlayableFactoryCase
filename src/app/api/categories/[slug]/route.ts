import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * @desc    Get category by slug
 * @route   GET /api/categories/[slug]
 * @access  Public
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    // Slug validation
    if (!slug || typeof slug !== 'string' || slug.length < 2) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Geçersiz kategori slug' 
        },
        { status: 400 }
      );
    }

    // Backend'den kategori detayını fetch et
    const response = await fetch(`${BACKEND_URL}/api/categories/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Frontend/1.0',
      },
      next: {
        revalidate: 120, // 2 dakika cache
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Kategori bulunamadı' 
          },
          { status: 404 }
        );
      }

      console.error('Backend response error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Kategori detayı yüklenirken hata oluştu' 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Response headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    headers.set('X-API-Source', 'NextJS-Proxy');
    headers.set('X-Category-Slug', slug);

    return NextResponse.json(data, { 
      status: 200,
      headers 
    });

  } catch (error) {
    console.error('Category by slug API route error:', error);
    
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