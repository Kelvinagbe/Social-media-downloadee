import { NextRequest, NextResponse } from 'next/server';

const UNIVERSAL_API_BASE = 'https://downloader.ovrica.name.ng';

async function resolveShortUrl(url: string): Promise<string> {
  try {
    if (url.includes('/video/') || url.includes('tiktok.com/@')) {
      return url;
    }

    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
      console.log('Resolving shortened URL...');
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const finalUrl = response.url || url;
      console.log('Resolved to:', finalUrl);
      return finalUrl;
    }
    return url;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return url;
  }
}

function extractVideoId(url: string): string | null {
  try {
    const videoMatch = url.match(/\/video\/(\d+)/);
    if (videoMatch) return videoMatch[1];
    const vMatch = url.match(/\/v\/(\d+)/);
    if (vMatch) return vMatch[1];
    return null;
  } catch (error) {
    return null;
  }
}

async function fetchFromUniversalAPI(url: string): Promise<any> {
  try {
    const apiUrl = `${UNIVERSAL_API_BASE}/api/tiktok/download?url=${encodeURIComponent(url)}`;
    console.log(`Calling Universal Downloader API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.log(`API returned status ${response.status}`);
      return {
        success: false,
        error: { message: `API returned status ${response.status}`, status: response.status }
      };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: { message: 'Invalid content type returned', contentType }
      };
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Check if we got valid data
    if (data.success && data.data) {
      console.log('Successfully fetched video data');
      return { success: true, data: data.data }; // Extract the nested data
    }

    console.log('API returned unsuccessful response:', data);
    return {
      success: false,
      error: { message: data.message || 'Failed to fetch video data', details: data }
    };

  } catch (error: any) {
    console.error('Universal API Error:', error);
    return {
      success: false,
      error: { message: error.message, type: error.name }
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, status: 400, message: 'URL parameter is required' },
        { status: 400 }
      );
    }

    if (!rawUrl.includes('tiktok.com')) {
      return NextResponse.json(
        { success: false, status: 400, message: 'Please provide a valid TikTok URL' },
        { status: 400 }
      );
    }

    console.log('Step 1: Original URL:', rawUrl);
    const resolvedUrl = await resolveShortUrl(rawUrl);
    console.log('Step 2: Resolved URL:', resolvedUrl);

    const videoId = extractVideoId(resolvedUrl);
    console.log('Step 3: Video ID:', videoId);

    console.log('Step 4: Calling Universal Downloader API...');
    const result = await fetchFromUniversalAPI(resolvedUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          status: 404,
          message: 'Could not fetch video data. The video might be private, deleted, or region-restricted.',
          debug: {
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl,
            videoId: videoId,
            error: result.error
          }
        },
        { status: 200 }
      );
    }

    console.log('Step 5: Success! Returning video data');
    
    // Return the data directly, not nested
    return NextResponse.json({
      success: true,
      data: result.data, // This will be picked up by frontend as data.data
      _meta: {
        api_used: 'Universal Downloader',
        endpoint: `${UNIVERSAL_API_BASE}/api/tiktok/download`
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('TikTok API Error:', error);

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, status: 408, message: 'Request timeout. Please try again.' },
        { status: 200 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, status: 503, message: 'Cannot connect to the video service.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        status: 500,
        message: 'An unexpected error occurred. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? {
          error: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUrl = body.url;

    if (!rawUrl || !rawUrl.includes('tiktok.com')) {
      return NextResponse.json(
        { success: false, status: 400, message: 'Valid TikTok URL is required' },
        { status: 400 }
      );
    }

    const resolvedUrl = await resolveShortUrl(rawUrl);
    const result = await fetchFromUniversalAPI(resolvedUrl);

    if (!result.success) {
      return NextResponse.json(
        { success: false, status: 404, message: 'Failed to fetch video data', debug: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('TikTok API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        status: 500,
        message: 'Failed to fetch video data',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}