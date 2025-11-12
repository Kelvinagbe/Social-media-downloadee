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

    // Log the raw data structure
    console.log('Raw data.data structure:', JSON.stringify(data.data, null, 2));

    // Transform to Universal Downloader format (downloads array)
    const transformedData = transformToUniversalFormat(data.data);

    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

    // Validate that we have downloadable content
    if (!transformedData || !transformedData.downloads || transformedData.downloads.length === 0) {
      console.error('No downloadable media found in transformed data');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Media found but no download URLs available. Please try again or use a different link.',
          debug: process.env.NODE_ENV === 'development' ? { 
            rawData: data.data,
            transformedData 
          } : undefined
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: 'Media fetched successfully',
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

/**
 * Transform metadownloader response to Universal Downloader format
 * Output format: { title, thumbnail, downloads: [{ text, url }] }
 */
function transformToUniversalFormat(data: any) {
  if (!data) {
    console.error('transformToUniversalFormat: data is null or undefined');
    return null;
  }

  console.log('Transform input keys:', Object.keys(data));

  const result: any = {
    title: data.title || data.caption || data.description || 'Facebook Video',
    thumbnail: data.thumbnail || data.thumb || data.image || data.picture || '',
    author: data.author || data.username || data.owner || '',
    duration: data.duration || '',
    downloads: [], // Universal Downloader format
  };

  // PRIORITY 1: Check for medias array (most common metadownloader format)
  if (data.medias && Array.isArray(data.medias) && data.medias.length > 0) {
    console.log('Found medias array with', data.medias.length, 'items');
    data.medias.forEach((media: any, index: number) => {
      console.log(`Media ${index}:`, media);
      if (media.url) {
        const quality = media.quality || media.resolution || 'Standard';
        const isHD = quality.toLowerCase().includes('hd') || 
                     quality.includes('720') || 
                     quality.includes('1080');
        
        result.downloads.push({
          text: `Video - ${quality}${isHD ? ' 🎬' : ''}`,
          url: media.url,
        });
      }
    });
  }

  // PRIORITY 2: Check for direct video URL fields (common alternatives)
  const videoFields = [
    { field: 'hd', label: 'Video - HD 🎬' },
    { field: 'sd', label: 'Video - SD' },
    { field: 'video_url', label: 'Video - Standard' },
    { field: 'videoUrl', label: 'Video - Standard' },
    { field: 'video', label: 'Video - Standard' },
  ];

  for (const { field, label } of videoFields) {
    if (data[field] && typeof data[field] === 'string') {
      console.log(`Found video URL in field: ${field}`, data[field]);
      
      // Avoid duplicates
      if (!result.downloads.some((d: any) => d.url === data[field])) {
        result.downloads.push({
          text: label,
          url: data[field],
        });
      }
    }
  }

  // PRIORITY 3: Check for links array (alternative format)
  if (data.links && Array.isArray(data.links)) {
    console.log('Found links array with', data.links.length, 'items');
    data.links.forEach((link: any, index: number) => {
      if (typeof link === 'string') {
        result.downloads.push({
          text: `Video Quality ${index + 1}`,
          url: link,
        });
      } else if (link && link.url) {
        const quality = link.quality || link.label || `Quality ${index + 1}`;
        result.downloads.push({
          text: `Video - ${quality}`,
          url: link.url,
        });
      }
    });
  }

  // PRIORITY 4: Check for single URL field (last resort)
  if (result.downloads.length === 0 && data.url && typeof data.url === 'string') {
    console.log('Using fallback single URL field');
    result.downloads.push({
      text: 'Download Video',
      url: data.url,
    });
  }

  // PRIORITY 5: Handle images (for photo posts)
  const imageFields = ['images', 'photos', 'pictures'];
  for (const field of imageFields) {
    if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
      console.log(`Found images in field: ${field}`, data[field].length);
      data[field].forEach((img: any, index: number) => {
        const imgUrl = typeof img === 'string' ? img : img.url || img.src;
        if (imgUrl) {
          result.downloads.push({
            text: `Image ${index + 1} 📸`,
            url: imgUrl,
          });
        }
      });
      break; // Only use first found image field
    }
  }

  // Single image fallback
  if (result.downloads.length === 0 && (data.image || data.picture)) {
    const imgUrl = data.image || data.picture;
    if (typeof imgUrl === 'string') {
      result.downloads.push({
        text: 'Download Image 📸',
        url: imgUrl,
      });
    }
  }

  // PRIORITY 6: Handle audio (if available)
  if (data.audio) {
    const audioUrl = typeof data.audio === 'string' ? data.audio : data.audio.url;
    if (audioUrl) {
      console.log('Found audio:', audioUrl);
      result.downloads.push({
        text: 'Audio Only 🎵',
        url: audioUrl,
      });
    }
  }

  console.log('Transform result - Total downloads:', result.downloads.length);
  console.log('Download items:', result.downloads);

  return result;
}