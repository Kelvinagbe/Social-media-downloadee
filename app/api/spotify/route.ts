// app/api/spotify/route.ts
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

    // Validate and clean Spotify URL
    const cleanedUrl = cleanSpotifyUrl(url);
    if (!isValidSpotifyUrl(cleanedUrl)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please provide a valid Spotify URL (track, album, playlist, or artist)' 
        },
        { status: 400 }
      );
    }

    console.log('Fetching Spotify content for URL:', cleanedUrl);

    const apiUrl = `${API_BASE}/api/spotify?url=${encodeURIComponent(cleanedUrl)}`;
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
          error: `Failed to fetch Spotify content (Status: ${response.status}). The content might be unavailable or region-restricted.` 
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('Backend API Response:', JSON.stringify(data, null, 2));

    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to fetch Spotify data' 
        },
        { status: 200 }
      );
    }

    const transformedData = transformSpotifyData(data.data);
    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

    if (!transformedData || !transformedData.downloads || transformedData.downloads.length === 0) {
      console.error('No downloadable media found');
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

    const cleanedUrl = cleanSpotifyUrl(url);
    if (!isValidSpotifyUrl(cleanedUrl)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Spotify URL' },
        { status: 400 }
      );
    }

    const newRequest = new NextRequest(
      `${request.nextUrl.origin}/api/spotify?url=${encodeURIComponent(cleanedUrl)}`,
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

/**
 * Clean Spotify URL by removing query parameters and fragments
 */
function cleanSpotifyUrl(url: string): string {
  try {
    // Remove query parameters and fragments
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl.trim();
  } catch {
    return url.trim();
  }
}

/**
 * Validate Spotify URL
 */
function isValidSpotifyUrl(url: string): boolean {
  try {
    const urlPattern = /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]+$/;
    return urlPattern.test(url);
  } catch {
    return false;
  }
}

/**
 * Transform Spotify API response to Universal Downloader format
 */
function transformSpotifyData(data: any) {
  if (!data) {
    console.error('Transform: data is null or undefined');
    return null;
  }

  console.log('Transform input:', Object.keys(data));

  const result: any = {
    title: data.title || data.name || 'Spotify Track',
    thumbnail: data.thumbnail || data.cover || data.image || '',
    duration: data.duration || '',
    author: data.author || data.artist || data.artists || '',
    downloads: [],
  };

  // Process downloadLinks array
  if (Array.isArray(data.downloadLinks) && data.downloadLinks.length > 0) {
    console.log('Processing downloadLinks:', data.downloadLinks.length);

    data.downloadLinks.forEach((link: any, index: number) => {
      console.log(`Link ${index}:`, link);

      if (!link.url) {
        console.warn('Skipping link without URL:', link);
        return;
      }

      const quality = link.quality || 'standard';
      const extension = link.extension || 'mp3';
      const type = link.type || 'audio';

      const displayText = formatDownloadText(quality, extension, type);

      result.downloads.push({
        text: displayText,
        url: link.url,
      });
    });
  }

  // Process medias array (alternative format)
  if (Array.isArray(data.medias) && data.medias.length > 0) {
    console.log('Processing medias:', data.medias.length);

    data.medias.forEach((media: any) => {
      if (!media.url) {
        console.warn('Skipping media without URL:', media);
        return;
      }

      const quality = media.quality || 'standard';
      const extension = media.extension || 'mp3';

      result.downloads.push({
        text: formatDownloadText(quality, extension, 'audio'),
        url: media.url,
      });
    });
  }

  // Fallback: check for direct URL fields
  if (result.downloads.length === 0) {
    console.log('No structured downloads found, checking direct URL fields');

    const directUrlFields = ['url', 'download_url', 'audio_url', 'downloadUrl', 'link'];
    
    for (const field of directUrlFields) {
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

  console.log(`Transform complete: ${result.downloads.length} downloads found`);

  return result;
}

/**
 * Format download text for display
 */
function formatDownloadText(quality: string, extension: string, type: string): string {
  const ext = extension.toUpperCase();
  const q = String(quality).toLowerCase();

  if (type === 'audio') {
    // Quality map with bitrate info
    const qualityMap: Record<string, string> = {
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
    };

    for (const [key, label] of Object.entries(qualityMap)) {
      if (q.includes(key)) {
        return `${label} - ${ext} 🎵`;
      }
    }

    return `Audio - ${ext} 🎵`;
  }

  return `${quality} - ${ext}`;
}