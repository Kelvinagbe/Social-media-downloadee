import { NextRequest, NextResponse } from 'next/server';

// Function to resolve shortened TikTok URLs
async function resolveShortUrl(url: string): Promise<string> {
  try {
    // If it's already a full URL, return it
    if (url.includes('/video/') || url.includes('tiktok.com/@')) {
      return url;
    }

    // If it's a shortened URL (vm.tiktok.com), resolve it
    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
      console.log('Resolving shortened URL...');
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      
      // Get the final URL after redirects
      const finalUrl = response.url || url;
      console.log('Resolved to:', finalUrl);
      return finalUrl;
    }

    return url;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return url; // Return original URL if resolution fails
  }
}

// Extract video ID from TikTok URL
function extractVideoId(url: string): string | null {
  try {
    // Pattern 1: /video/1234567890
    const videoMatch = url.match(/\/video\/(\d+)/);
    if (videoMatch) return videoMatch[1];

    // Pattern 2: /v/1234567890
    const vMatch = url.match(/\/v\/(\d+)/);
    if (vMatch) return vMatch[1];

    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawUrl = searchParams.get('url');
    
    // Validate URL parameter
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

    // Validate TikTok URL
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

    // Resolve shortened URLs first
    console.log('Step 1: Original URL:', rawUrl);
    const resolvedUrl = await resolveShortUrl(rawUrl);
    console.log('Step 2: Resolved URL:', resolvedUrl);

    // Extract video ID for debugging
    const videoId = extractVideoId(resolvedUrl);
    console.log('Step 3: Video ID:', videoId);

    // Try the Gifted Tech API
    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(resolvedUrl)}`;
    
    console.log('Step 4: Calling API...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(45000), // 45 seconds timeout
    });

    console.log('Step 5: API Response Status:', response.status);

    if (!response.ok) {
      console.error('API responded with error status:', response.status);
      
      // Try to get error message from response
      let errorMessage = `API server returned status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) {
        // Ignore JSON parse errors
      }

      return NextResponse.json(
        { 
          success: false,
          status: response.status,
          message: errorMessage,
          debug: {
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl,
            videoId: videoId
          }
        },
        { status: 200 }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      const textResponse = await response.text();
      console.error('Response text:', textResponse.substring(0, 200));
      
      return NextResponse.json(
        { 
          success: false,
          status: 500,
          message: 'API returned invalid response format',
          debug: {
            contentType,
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl
          }
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Step 6: API Response Data:', JSON.stringify(data, null, 2));

    // Check if the API returned an error
    if (data.success === false) {
      return NextResponse.json(
        { 
          success: false,
          status: data.status || 400,
          message: data.message || 'API returned an error',
          debug: {
            apiResponse: data,
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl,
            videoId: videoId
          }
        },
        { status: 200 }
      );
    }

    // Check if result is null or empty
    if (!data.result || data.result === null) {
      console.error('Result is null - possible reasons:');
      console.error('1. Video might be private or deleted');
      console.error('2. Video might be region-restricted');
      console.error('3. API might not support this video format');
      console.error('4. URL might not have resolved correctly');
      
      return NextResponse.json(
        { 
          success: false,
          status: 404,
          message: 'Could not fetch video data. This could mean:\n• The video is private or deleted\n• The video is region-restricted\n• The API cannot access this video\n\nTry:\n1. Make sure the video is public\n2. Copy the URL directly from TikTok app (not browser)\n3. Try a different video to test if the service is working',
          debug: {
            apiResponse: data,
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl,
            videoId: videoId,
            apiMessage: data.message
          }
        },
        { status: 200 }
      );
    }

    // Success! Return the data
    console.log('Step 7: Success! Returning video data');
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
    
  } catch (error: any) {
    console.error('TikTok API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          status: 408,
          message: 'Request timeout. The API took too long to respond. This might mean:\n• The API server is slow or overloaded\n• Your internet connection is slow\n\nPlease try again in a few moments.' 
        },
        { status: 200 }
      );
    }

    // Handle network errors
    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false,
          status: 503,
          message: 'Cannot connect to the video service. The API might be down or unreachable.\n\nPlease try again later.' 
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
    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(resolvedUrl)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(45000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          status: response.status,
          message: `API responded with status: ${response.status}` 
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
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