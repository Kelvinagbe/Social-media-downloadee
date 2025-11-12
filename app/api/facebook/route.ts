// app/api/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Your universalDownloader API base URL - MUST include https://
const API_BASE = 'https://downloader.ovrica.name.ng';

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

    // Call universalDownloader API with correct endpoint
    const apiUrl = `${API_BASE}/api/meta/download?url=${encodeURIComponent(url)}`;
    console.log('Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API returned status ${response.status}:`, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch media (Status: ${response.status}). The video might be private or unavailable.` 
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Backend API Response:', JSON.stringify(data, null, 2));

    // Check if the API returned an error
    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || data.message || 'Failed to fetch media data' 
        },
        { status: 200 }
      );
    }

    // Return the data as-is since universalDownloader already formats it correctly
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
        { success: false, error: 'Request timeout. The server took too long to respond. Please try again.' },
        { status: 200 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, error: 'Cannot connect to the download service. Please check if the API server is running.' },
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

    console.log('POST request - Fetching Facebook media for URL:', url);

    // Use the same endpoint as GET
    const apiUrl = `${API_BASE}/api/meta/download?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media data. The video might be private or unavailable.' },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    return NextResponse.json(
      {
        success: data.success,
        data: data.data,
        error: data.error || data.message
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