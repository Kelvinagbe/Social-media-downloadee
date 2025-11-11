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
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      
      // Get the final URL after redirects
      return response.url || url;
    }

    return url;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return url; // Return original URL if resolution fails
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

    // Resolve shortened URLs
    console.log('Original URL:', rawUrl);
    const resolvedUrl = await resolveShortUrl(rawUrl);
    console.log('Resolved URL:', resolvedUrl);

    // Call the Gifted Tech API with resolved URL
    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(resolvedUrl)}`;
    
    console.log('Fetching from Gifted Tech API...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      console.error('API responded with status:', response.status);
      return NextResponse.json(
        { 
          success: false,
          status: response.status,
          message: `API server returned status ${response.status}. Please try again.` 
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      return NextResponse.json(
        { 
          success: false,
          status: 500,
          message: 'Invalid response from API server' 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Check if the API returned an error
    if (data.success === false) {
      return NextResponse.json(
        { 
          success: false,
          status: data.status || 400,
          message: data.message || 'Failed to fetch video data' 
        },
        { status: 200 } // Still return 200 so client can read the error message
      );
    }

    // Check if result is null or empty
    if (!data.result || data.result === null) {
      return NextResponse.json(
        { 
          success: false,
          status: 404,
          message: 'Video not found. The video might be private, deleted, or region-restricted.' 
        },
        { status: 200 }
      );
    }

    // Return the successful data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
    
  } catch (error: any) {
    console.error('TikTok API Error:', error);
    
    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          status: 408,
          message: 'Request timeout. The server took too long to respond. Please try again.' 
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
          message: 'Could not connect to the video service. Please try again later.' 
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        status: 500,
        message: 'An unexpected error occurred while processing your request.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}

// Optional: Add POST method if needed
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

    // Resolve shortened URLs
    const resolvedUrl = await resolveShortUrl(rawUrl);
    console.log('Resolved URL:', resolvedUrl);

    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(resolvedUrl)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000),
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
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}