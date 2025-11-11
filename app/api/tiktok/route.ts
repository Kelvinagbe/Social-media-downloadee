import { NextRequest, NextResponse } from 'next/server';

// Function to resolve shortened TikTok URLs
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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

// Extract video ID from TikTok URL
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

// Try multiple API endpoints as fallbacks
async function fetchFromAPI(url: string): Promise<any> {
  const endpoints = [
    'https://api.giftedtech.co.ke/api/download/tiktok',
    'https://api.giftedtech.co.ke/api/download/tiktokdlv2',
    'https://api.giftedtech.co.ke/api/download/tiktokdlv3',
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const apiUrl = `${endpoint}?apikey=gifted&url=${encodeURIComponent(url)}`;
      console.log(`Trying endpoint: ${endpoint}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(30000), // 30 seconds per attempt
      });

      if (!response.ok) {
        console.log(`Endpoint ${endpoint} returned status ${response.status}`);
        continue;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`Endpoint ${endpoint} returned invalid content type`);
        continue;
      }

      const data = await response.json();
      
      // Check if we got a valid result
      if (data.result && data.result !== null && data.success !== false) {
        console.log(`Success with endpoint: ${endpoint}`);
        return { success: true, data, endpoint };
      }

      console.log(`Endpoint ${endpoint} returned null result`);
      lastError = { message: 'Result is null', endpoint };

    } catch (error: any) {
      console.log(`Endpoint ${endpoint} failed:`, error.message);
      lastError = { message: error.message, endpoint };
      continue;
    }
  }

  // All endpoints failed
  return { 
    success: false, 
    error: lastError || { message: 'All endpoints failed' }
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'URL parameter is required' 
        },
        { status: 400 }
      );
    }

    if (!rawUrl.includes('tiktok.com')) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'Please provide a valid TikTok URL' 
        },
        { status: 400 }
      );
    }

    console.log('Step 1: Original URL:', rawUrl);
    const resolvedUrl = await resolveShortUrl(rawUrl);
    console.log('Step 2: Resolved URL:', resolvedUrl);

    const videoId = extractVideoId(resolvedUrl);
    console.log('Step 3: Video ID:', videoId);

    console.log('Step 4: Trying API endpoints...');
    const result = await fetchFromAPI(resolvedUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          status: 404,
          message: 'Could not fetch video data from any endpoint. This could mean:\n• The video is private or deleted\n• The video is region-restricted\n• The API cannot access this video\n\nTry:\n1. Make sure the video is public\n2. Copy the URL directly from TikTok app\n3. Try a different video to test if the service is working',
          debug: {
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl,
            videoId: videoId,
            lastError: result.error
          }
        },
        { status: 200 }
      );
    }

    console.log('Step 5: Success! Returning video data');
    return NextResponse.json({
      ...result.data,
      _meta: {
        endpoint_used: result.endpoint
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('TikTok API Error:', error);
    console.error('Error stack:', error.stack);

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          status: 408,
          message: 'Request timeout. Please try again in a few moments.' 
        },
        { status: 200 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false,
          status: 503,
          message: 'Cannot connect to the video service. Please try again later.' 
        },
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

    if (!rawUrl) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'URL is required in request body' 
        },
        { status: 400 }
      );
    }

    if (!rawUrl.includes('tiktok.com')) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'Please provide a valid TikTok URL' 
        },
        { status: 400 }
      );
    }

    const resolvedUrl = await resolveShortUrl(rawUrl);
    const result = await fetchFromAPI(resolvedUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          status: 404,
          message: 'Failed to fetch video data from all endpoints',
          debug: result.error
        },
        { status: 200 }
      );
    }

    return NextResponse.json(result.data, {
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