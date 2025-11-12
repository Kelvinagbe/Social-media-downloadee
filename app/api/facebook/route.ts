// app/api/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Your backend API base URL
const API_BASE = 'downloader.ovrica.name.ng';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate Facebook URL
    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Facebook URL' },
        { status: 400 }
      );
    }

    console.log('Fetching Facebook media for URL:', url);

    // Call your backend API
    const response = await fetch(
      `${API_BASE}/api/facebook-insta/download?url=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    if (!response.ok) {
      console.error(`Backend API returned status ${response.status}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch media (Status: ${response.status})` 
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Backend API Response:', data);

    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to fetch media data' 
        },
        { status: 200 }
      );
    }

    // Return the data
    return NextResponse.json(
      {
        success: true,
        data: data.data,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );

  } catch (error: any) {
    console.error('Facebook API Error:', error);

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout. Please try again.' },
        { status: 200 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, error: 'Cannot connect to the media service.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Facebook URL' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE}/api/meta/download?url=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media data' },
        { status: 200 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: data.success,
        data: data.data,
        error: data.error
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );

  } catch (error: any) {
    console.error('Facebook API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch media data',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}
