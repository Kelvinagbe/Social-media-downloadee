import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    
    // Validate URL parameter
    if (!url) {
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
    if (!url.includes('tiktok.com')) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'Please provide a valid TikTok URL' 
        },
        { status: 400 }
      );
    }

    // Call the Gifted Tech API
    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(url)}`;
    
    console.log('Fetching from Gifted Tech API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('API responded with status:', response.status);
      return NextResponse.json(
        { 
          success: false,
          status: response.status,
          message: `API responded with status: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Response:', data);

    // Return the data from the API
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
    
  } catch (error: any) {
    console.error('TikTok API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        status: 500,
        message: 'Failed to fetch video data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method if needed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'URL is required in request body' 
        },
        { status: 400 }
      );
    }

    if (!url.includes('tiktok.com')) {
      return NextResponse.json(
        { 
          success: false,
          status: 400,
          message: 'Please provide a valid TikTok URL' 
        },
        { status: 400 }
      );
    }

    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false,
          status: response.status,
          message: `API responded with status: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
    
  } catch (error: any) {
    console.error('TikTok API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        status: 500,
        message: 'Failed to fetch video data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}