import { NextRequest, NextResponse } from 'next/server';

const TWITTER_API_BASE = 'https://downloader.ovrica.name.ng'; // Replace with your backend URL

async function resolveShortUrl(url: string): Promise<string> {
  try {
    // Check if it's already a full Twitter/X URL
    if (url.includes('/status/') || url.includes('twitter.com/') || url.includes('x.com/')) {
      return url;
    }

    // Handle shortened URLs (t.co, etc.)
    if (url.includes('t.co') || url.length < 30) {
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

function extractTweetId(url: string): string | null {
  try {
    // Match twitter.com or x.com status URLs
    const statusMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (statusMatch) return statusMatch[1];
    
    // Match direct status IDs
    const idMatch = url.match(/status\/(\d+)/);
    if (idMatch) return idMatch[1];
    
    return null;
  } catch (error) {
    return null;
  }
}

async function fetchFromTwitterAPI(url: string): Promise<any> {
  try {
    const apiUrl = `${TWITTER_API_BASE}/api/twitter/download?url=${encodeURIComponent(url)}`;
    console.log(`Calling Twitter Downloader API: ${apiUrl}`);

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
    console.log('=== FULL API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== DATA STRUCTURE ===');
    console.log('data.success:', data.success);
    console.log('data.data:', data.data);
    console.log('data.data length:', data.data ? data.data.length : 'N/A');

    // Check if we got valid data
    if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
      console.log('Successfully fetched media data');
      return { success: true, data: data.data };
    }

    console.log('API returned unsuccessful response:', data);
    return {
      success: false,
      error: { message: data.error || 'Failed to fetch media data', details: data }
    };

  } catch (error: any) {
    console.error('Twitter API Error:', error);
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

    if (!rawUrl.includes('twitter.com') && !rawUrl.includes('x.com')) {
      return NextResponse.json(
        { success: false, status: 400, message: 'Please provide a valid Twitter/X URL' },
        { status: 400 }
      );
    }

    console.log('Step 1: Original URL:', rawUrl);
    const resolvedUrl = await resolveShortUrl(rawUrl);
    console.log('Step 2: Resolved URL:', resolvedUrl);

    const tweetId = extractTweetId(resolvedUrl);
    console.log('Step 3: Tweet ID:', tweetId);

    console.log('Step 4: Calling Twitter Downloader API...');
    const result = await fetchFromTwitterAPI(resolvedUrl);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          status: 404,
          message: 'Could not fetch media data. The tweet might be private, deleted, or does not contain media.',
          debug: {
            originalUrl: rawUrl,
            resolvedUrl: resolvedUrl,
            tweetId: tweetId,
            error: result.error
          }
        },
        { status: 200 }
      );
    }

    console.log('Step 5: Success! Returning media data');

    return NextResponse.json({
      success: true,
      data: result.data,
      _meta: {
        api_used: 'Twmate Downloader',
        endpoint: `${TWITTER_API_BASE}/api/twitter/download`,
        tweetId: tweetId
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error: any) {
    console.error('Twitter API Error:', error);

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, status: 408, message: 'Request timeout. Please try again.' },
        { status: 200 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, status: 503, message: 'Cannot connect to the download service.' },
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

    if (!rawUrl || (!rawUrl.includes('twitter.com') && !rawUrl.includes('x.com'))) {
      return NextResponse.json(
        { success: false, status: 400, message: 'Valid Twitter/X URL is required' },
        { status: 400 }
      );
    }

    const resolvedUrl = await resolveShortUrl(rawUrl);
    const result = await fetchFromTwitterAPI(resolvedUrl);

    if (!result.success) {
      return NextResponse.json(
        { success: false, status: 404, message: 'Failed to fetch media data', debug: result.error },
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
    console.error('Twitter API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        status: 500,
        message: 'Failed to fetch media data',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}