// app/api/spotify/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Your universalDownloader API base URL
const API_BASE = 'https://downloader.ovrica.name.ng';

// Health check function
async function checkBackendHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return { healthy: response.ok, message: `Backend responded with status ${response.status}` };
  } catch (error: any) {
    return { healthy: false, message: `Backend unreachable: ${error.message}` };
  }
}

// Add retry logic
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status === 404) return response;
      if (i < retries - 1) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}

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

    if (!isValidSpotifyUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Spotify URL (track, album, playlist, or artist)' },
        { status: 400 }
      );
    }

    console.log('Fetching Spotify content for URL:', url);

    // Optional: Check backend health in development
    if (process.env.NODE_ENV === 'development') {
      const health = await checkBackendHealth();
      console.log('Backend health check:', health);
    }

    const apiUrl = `${API_BASE}/api/spotify?url=${encodeURIComponent(url)}`;
    console.log('Calling API:', apiUrl);

    const response = await fetchWithRetry(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://spotify.downloaderize.com/',
        'Origin': 'https://spotify.downloaderize.com',
      },
      signal: AbortSignal.timeout(30000),
    }, 2);

    console.log('API Response Status:', response.status);

    if (!response.ok) {
      let errorText = '';
      let errorDetails = '';
      
      try {
        errorText = await response.text();
        console.error(`Backend API returned status ${response.status}:`, errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error || errorJson.message || '';
        } catch (e) {
          errorDetails = errorText.substring(0, 200);
        }
      } catch (e) {
        console.error('Could not read error response:', e);
      }

      let userMessage = '';
      if (response.status === 404) {
        userMessage = 'The backend API endpoint was not found. Please check that your API server is running and the endpoint exists at /api/spotify';
      } else if (response.status === 500) {
        userMessage = 'The backend server encountered an error. This might be due to an issue with the nonce or the external service.';
      } else if (response.status === 503) {
        userMessage = 'The download service is currently unavailable. Please try again later.';
      } else {
        userMessage = `Failed to fetch Spotify content (Status: ${response.status})`;
      }

      return NextResponse.json(
        { 
          success: false, 
          error: userMessage,
          details: errorDetails || undefined,
          statusCode: response.status,
          apiUrl: process.env.NODE_ENV === 'development' ? apiUrl : undefined
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Backend API Raw Response:', JSON.stringify(data, null, 2));

    if (!data || !data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data?.error || 'Failed to fetch Spotify data. The backend returned an unsuccessful response.',
          details: data?.message || undefined
        },
        { status: 200 }
      );
    }

    console.log('Raw data.data structure:', JSON.stringify(data.data, null, 2));

    const transformedData = transformSpotifyToUniversalFormat(data.data);
    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

    if (!transformedData || !transformedData.downloads || transformedData.downloads.length === 0) {
      console.error('No downloadable media found in transformed data');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Content found but no download URLs available. The content might be restricted.',
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
        message: 'Spotify content fetched successfully',
        data: transformedData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );

  } catch (error: any) {
    console.error('Spotify API Error:', error);
    console.error('Error stack:', error.stack);

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'Request timeout. The backend service took too long to respond. Please try again.' },
        { status: 200 }
      );
    }

    if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot connect to the backend service. Please ensure your API server is running.',
          details: process.env.NODE_ENV === 'development' ? `Backend URL: ${API_BASE}/api/spotify` : undefined
        },
        { status: 200 }
      );
    }

    if (error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot resolve backend service hostname. Please check your API_BASE URL configuration.',
          details: process.env.NODE_ENV === 'development' ? `Backend URL: ${API_BASE}` : undefined
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'An unexpected error occurred while processing your request.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        errorType: process.env.NODE_ENV === 'development' ? error.name : undefined
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

    if (!isValidSpotifyUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Spotify URL' },
        { status: 400 }
      );
    }

    const newRequest = new NextRequest(
      `${request.nextUrl.origin}/api/spotify?url=${encodeURIComponent(url)}`,
      { method: 'GET' }
    );

    return GET(newRequest);

  } catch (error: any) {
    console.error('Spotify API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Spotify data',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}

function isValidSpotifyUrl(url: string): boolean {
  const regex = /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+/;
  return regex.test(url);
}

function transformSpotifyToUniversalFormat(data: any) {
  if (!data) {
    console.error('transformSpotifyToUniversalFormat: data is null or undefined');
    return null;
  }

  console.log('Transform input keys:', Object.keys(data));

  const result: any = {
    title: data.title || 'Spotify Track',
    thumbnail: data.thumbnail || data.cover || '',
    duration: data.duration || '',
    author: data.author || data.artist || '',
    downloads: [],
  };

  if (data.downloadLinks && Array.isArray(data.downloadLinks) && data.downloadLinks.length > 0) {
    console.log('Found downloadLinks array with', data.downloadLinks.length, 'items');

    data.downloadLinks.forEach((link: any) => {
      console.log('Processing download link:', link);

      if (!link.url) {
        console.warn('Skipping link without URL:', link);
        return;
      }

      const quality = link.quality || 'standard';
      const extension = link.extension || 'mp3';
      const type = link.type || 'audio';

      let downloadText = '';

      if (type === 'audio') {
        downloadText = formatAudioQuality(quality, extension);
      } else {
        downloadText = `${quality} - ${extension.toUpperCase()}`;
      }

      result.downloads.push({
        text: downloadText,
        url: link.url,
      });
    });
  }

  if (data.medias && Array.isArray(data.medias) && data.medias.length > 0) {
    console.log('Found medias array with', data.medias.length, 'items');

    data.medias.forEach((media: any) => {
      if (!media.url) {
        console.warn('Skipping media without URL:', media);
        return;
      }

      const quality = media.quality || 'standard';
      const extension = media.extension || 'mp3';

      result.downloads.push({
        text: formatAudioQuality(quality, extension),
        url: media.url,
      });
    });
  }

  if (result.downloads.length === 0) {
    console.log('No downloadLinks found, checking for direct URL fields');

    const directFields = ['url', 'download_url', 'audio_url', 'downloadUrl'];
    for (const field of directFields) {
      if (data[field] && typeof data[field] === 'string') {
        console.log(`Found direct URL in field: ${field}`);
        result.downloads.push({
          text: 'Download MP3 🎵',
          url: data[field],
        });
        break;
      }
    }
  }

  console.log('Transform result - Total downloads:', result.downloads.length);
  console.log('Download items:', result.downloads);

  return result;
}

function formatAudioQuality(quality: string, extension: string): string {
  const ext = extension.toUpperCase();
  const q = String(quality).toLowerCase();

  const qualityMap: { [key: string]: string } = {
    '320': 'High Quality (320kbps)',
    '256': 'High Quality (256kbps)',
    '192': 'Good Quality (192kbps)',
    '160': 'Standard Quality (160kbps)',
    '128': 'Standard Quality (128kbps)',
    '96': 'Low Quality (96kbps)',
    'high': 'High Quality',
    'medium': 'Medium Quality',
    'low': 'Low Quality',
    'standard': 'Standard Quality',
    'unknown': 'Audio',
  };

  for (const [key, label] of Object.entries(qualityMap)) {
    if (q.includes(key)) {
      return `${label} 🎵 - ${ext}`;
    }
  }

  return `Audio ${quality !== 'unknown' ? `(${quality})` : ''} 🎵 - ${ext}`;
}