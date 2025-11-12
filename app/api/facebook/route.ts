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

    // Call your actual backend endpoint (meta for Facebook/Instagram)
    const apiUrl = `${API_BASE}/api/meta/download?url=${encodeURIComponent(url)}`;
    console.log('Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000),
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
    console.log('Backend API Raw Response:', JSON.stringify(data, null, 2));

    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to fetch media data' 
        },
        { status: 200 }
      );
    }

    // Transform the metadownloader response to match frontend expectations
    const transformedData = transformMetaDownloaderResponse(data.data);
    
    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

    return NextResponse.json(
      {
        success: true,
        data: transformedData,
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
        { success: false, error: 'Cannot connect to the download service. Please check if the API is running.' },
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

    // Redirect to GET handler
    const newRequest = new NextRequest(
      `${request.nextUrl.origin}/api/facebook?url=${encodeURIComponent(url)}`,
      { method: 'GET' }
    );
    
    return GET(newRequest);

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

// Transform metadownloader response format to match frontend expectations
function transformMetaDownloaderResponse(data: any) {
  if (!data) return null;

  // metadownloader returns different structures for FB/IG
  // Common formats: { url, title, thumbnail, medias: [{url, quality}] }
  
  const transformed: any = {
    title: data.title || data.caption || 'Facebook Video',
    thumbnail: data.thumbnail || data.thumb || data.image || '',
    author: data.author || data.username || '',
    duration: data.duration || '',
    video: [],
    audio: [],
    image: [],
    url: data.url || '',
  };

  // Handle video formats
  if (data.medias && Array.isArray(data.medias)) {
    data.medias.forEach((media: any) => {
      if (media.url) {
        transformed.video.push({
          quality: media.quality || media.resolution || 'SD',
          url: media.url,
          resolution: media.quality || 'Standard',
          format: media.extension || 'mp4',
          hasAudio: true,
        });
      }
    });
  }

  // Handle direct URL fields
  if (data.sd && !transformed.video.some((v: any) => v.url === data.sd)) {
    transformed.video.push({
      quality: 'SD',
      url: data.sd,
      resolution: 'Standard Definition',
      format: 'mp4',
      hasAudio: true,
    });
  }

  if (data.hd && !transformed.video.some((v: any) => v.url === data.hd)) {
    transformed.video.push({
      quality: 'HD',
      url: data.hd,
      resolution: 'High Definition',
      format: 'mp4',
      hasAudio: true,
    });
  }

  // Handle single URL
  if (data.url && transformed.video.length === 0) {
    transformed.video.push({
      quality: 'Standard',
      url: data.url,
      resolution: 'Standard',
      format: 'mp4',
      hasAudio: true,
    });
  }

  // Handle images (for photo posts)
  if (data.images && Array.isArray(data.images)) {
    transformed.image = data.images;
  } else if (data.image && typeof data.image === 'string') {
    transformed.image = [data.image];
  }

  // Handle audio
  if (data.audio) {
    transformed.audio.push({
      quality: 'Original',
      url: data.audio,
      format: 'mp3',
    });
  }

  return transformed;
}