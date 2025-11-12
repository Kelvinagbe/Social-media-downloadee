// app/api/facebook/route.ts
import { NextRequest, NextResponse } from 'next/server';

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

    if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Facebook URL' },
        { status: 400 }
      );
    }

    console.log('Fetching Facebook media for URL:', url);

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

    // ENHANCED: Log the raw data structure before transformation
    console.log('Raw data.data structure:', JSON.stringify(data.data, null, 2));

    const transformedData = transformMetaDownloaderResponse(data.data);

    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

    // ADDED: Validate that we have downloadable content
    if (!transformedData || 
        (transformedData.video.length === 0 && 
         transformedData.image.length === 0 && 
         transformedData.audio.length === 0)) {
      console.error('No downloadable media found in transformed data');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Media found but no download URLs available. Please try again or use a different link.',
          debug: process.env.NODE_ENV === 'development' ? { rawData: data.data } : undefined
        },
        { status: 200 }
      );
    }

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

// ENHANCED transformation function with more robust handling
function transformMetaDownloaderResponse(data: any) {
  if (!data) {
    console.error('transformMetaDownloaderResponse: data is null or undefined');
    return null;
  }

  console.log('Transform input keys:', Object.keys(data));

  const transformed: any = {
    title: data.title || data.caption || data.description || 'Facebook Video',
    thumbnail: data.thumbnail || data.thumb || data.image || data.picture || '',
    author: data.author || data.username || data.owner || '',
    duration: data.duration || '',
    video: [],
    audio: [],
    image: [],
    url: data.source || data.url || '',
  };

  // PRIORITY 1: Check for common metadownloader fields
  // The package typically returns: { url, title, medias: [{url, quality}] }
  
  // Handle medias array (most common format)
  if (data.medias && Array.isArray(data.medias) && data.medias.length > 0) {
    console.log('Found medias array with', data.medias.length, 'items');
    data.medias.forEach((media: any, index: number) => {
      console.log(`Media ${index}:`, media);
      if (media.url) {
        transformed.video.push({
          quality: media.quality || media.resolution || `Quality ${index + 1}`,
          url: media.url,
          resolution: media.quality || media.resolution || 'Standard',
          format: media.extension || media.ext || 'mp4',
          hasAudio: media.hasAudio !== false,
        });
      }
    });
  }

  // PRIORITY 2: Check for direct video URL fields
  const videoFields = ['video_url', 'videoUrl', 'video', 'sd', 'hd', 'url'];
  for (const field of videoFields) {
    if (data[field] && typeof data[field] === 'string') {
      console.log(`Found video URL in field: ${field}`, data[field]);
      if (!transformed.video.some((v: any) => v.url === data[field])) {
        transformed.video.push({
          quality: field === 'hd' ? 'HD' : field === 'sd' ? 'SD' : 'Standard',
          url: data[field],
          resolution: field === 'hd' ? 'High Definition' : 'Standard Definition',
          format: 'mp4',
          hasAudio: true,
        });
      }
    }
  }

  // PRIORITY 3: Check for links array (alternative format)
  if (data.links && Array.isArray(data.links)) {
    console.log('Found links array with', data.links.length, 'items');
    data.links.forEach((link: any, index: number) => {
      if (typeof link === 'string') {
        transformed.video.push({
          quality: `Quality ${index + 1}`,
          url: link,
          resolution: 'Standard',
          format: 'mp4',
          hasAudio: true,
        });
      } else if (link && link.url) {
        transformed.video.push({
          quality: link.quality || link.label || `Quality ${index + 1}`,
          url: link.url,
          resolution: link.resolution || 'Standard',
          format: link.format || 'mp4',
          hasAudio: link.hasAudio !== false,
        });
      }
    });
  }

  // PRIORITY 4: Handle images
  const imageFields = ['images', 'photos', 'pictures'];
  for (const field of imageFields) {
    if (data[field] && Array.isArray(data[field])) {
      console.log(`Found images in field: ${field}`, data[field].length);
      transformed.image = data[field].map((img: any) => 
        typeof img === 'string' ? img : img.url || img.src
      ).filter(Boolean);
      break;
    }
  }

  // Single image
  if (transformed.image.length === 0 && (data.image || data.picture)) {
    const imgUrl = data.image || data.picture;
    if (typeof imgUrl === 'string') {
      transformed.image = [imgUrl];
    }
  }

  // PRIORITY 5: Handle audio
  if (data.audio) {
    console.log('Found audio:', data.audio);
    transformed.audio.push({
      quality: 'Original',
      url: typeof data.audio === 'string' ? data.audio : data.audio.url,
      format: 'mp3',
    });
  }

  console.log('Transform result - Videos:', transformed.video.length, 
              'Images:', transformed.image.length, 
              'Audio:', transformed.audio.length);

  return transformed;
}