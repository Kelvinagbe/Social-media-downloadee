// app/api/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Your universalDownloader API base URL
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

    // Validate YouTube URL
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid YouTube URL' },
        { status: 400 }
      );
    }

    console.log('Fetching YouTube video for URL:', url);

    // Call your backend endpoint
    const apiUrl = `${API_BASE}/api/youtube/download?url=${encodeURIComponent(url)}`;
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
          error: `Failed to fetch video (Status: ${response.status}). The video might be unavailable or age-restricted.` 
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
          error: data.error || 'Failed to fetch video data' 
        },
        { status: 200 }
      );
    }

    // Log the raw data structure
    console.log('Raw data.data structure:', JSON.stringify(data.data, null, 2));

    // Transform to Universal Downloader format
    const transformedData = transformYouTubeToUniversalFormat(data.data);

    console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));

    // Validate that we have downloadable content
    if (!transformedData || !transformedData.downloads || transformedData.downloads.length === 0) {
      console.error('No downloadable media found in transformed data');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video found but no download URLs available. The video might be restricted.',
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
        message: 'Video fetched successfully',
        data: transformedData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );

  } catch (error: any) {
    console.error('YouTube API Error:', error);

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

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid YouTube URL' },
        { status: 400 }
      );
    }

    const newRequest = new NextRequest(
      `${request.nextUrl.origin}/api/youtube?url=${encodeURIComponent(url)}`,
      { method: 'GET' }
    );

    return GET(newRequest);

  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch video data',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}

/**
 * Transform YouTube API response to Universal Downloader format
 * Input: { title, thumbnail, duration, formats: [{ type, quality, extension, url }] }
 * Output: { title, thumbnail, duration, downloads: [{ text, url }] }
 */
function transformYouTubeToUniversalFormat(data: any) {
  if (!data) {
    console.error('transformYouTubeToUniversalFormat: data is null or undefined');
    return null;
  }

  console.log('Transform input keys:', Object.keys(data));

  const result: any = {
    title: data.title || 'YouTube Video',
    thumbnail: data.thumbnail || data.cover || '',
    duration: data.duration || '',
    author: data.author || data.channel || '',
    downloads: [],
  };

  // Handle formats array from your backend
  if (data.formats && Array.isArray(data.formats) && data.formats.length > 0) {
    console.log('Found formats array with', data.formats.length, 'items');

    // Separate videos and audio
    const videos: any[] = [];
    const audios: any[] = [];

    data.formats.forEach((format: any) => {
      console.log('Processing format:', format);

      if (!format.url) {
        console.warn('Skipping format without URL:', format);
        return;
      }

      const quality = format.quality || format.label || 'unknown';
      const type = format.type || '';
      const ext = format.extension || format.ext || '';

      // Determine if it's video or audio
      if (type === 'video' || type.includes('video') || ext === 'mp4' || ext === 'webm') {
        videos.push({
          quality,
          url: format.url,
          ext,
          format
        });
      } else if (type === 'audio' || type.includes('audio') || ext === 'm4a' || ext === 'mp3' || ext === 'webm') {
        audios.push({
          quality,
          url: format.url,
          ext,
          format
        });
      } else {
        // Default to video if type is unclear
        videos.push({
          quality,
          url: format.url,
          ext,
          format
        });
      }
    });

    console.log('Separated - Videos:', videos.length, 'Audios:', audios.length);

    // Add video downloads (sorted by quality)
    const sortedVideos = sortByQuality(videos);
    sortedVideos.forEach((video) => {
      const qualityLabel = formatQualityLabel(video.quality);
      const isHD = isHDQuality(video.quality);
      
      result.downloads.push({
        text: `${qualityLabel}${isHD ? ' 🎬' : ''} - ${video.ext.toUpperCase()}`,
        url: video.url,
      });
    });

    // Add audio downloads
    audios.forEach((audio) => {
      const qualityLabel = audio.quality === 'unknown' ? 'Audio' : `Audio - ${audio.quality}`;
      
      result.downloads.push({
        text: `${qualityLabel} 🎵 - ${audio.ext.toUpperCase()}`,
        url: audio.url,
      });
    });
  }

  // Fallback: if no formats found, check for direct fields
  if (result.downloads.length === 0) {
    console.log('No formats found, checking for direct URL fields');

    const directFields = ['url', 'download_url', 'video_url'];
    for (const field of directFields) {
      if (data[field] && typeof data[field] === 'string') {
        console.log(`Found direct URL in field: ${field}`);
        result.downloads.push({
          text: 'Download Video',
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

// Helper: Sort formats by quality (highest first)
function sortByQuality(formats: any[]): any[] {
  const qualityOrder: { [key: string]: number } = {
    '2160p': 10, '4k': 10, '2160': 10,
    '1440p': 9, '1440': 9,
    '1080p': 8, '1080': 8,
    '720p': 7, '720': 7,
    '480p': 6, '480': 6,
    '360p': 5, '360': 5,
    '240p': 4, '240': 4,
    '144p': 3, '144': 3,
  };

  return formats.sort((a, b) => {
    const aQuality = String(a.quality).toLowerCase();
    const bQuality = String(b.quality).toLowerCase();
    
    const aScore = Object.keys(qualityOrder).find(key => aQuality.includes(key));
    const bScore = Object.keys(qualityOrder).find(key => bQuality.includes(key));
    
    const aValue = aScore ? qualityOrder[aScore] : 0;
    const bValue = bScore ? qualityOrder[bScore] : 0;
    
    return bValue - aValue;
  });
}

// Helper: Format quality label for display
function formatQualityLabel(quality: string): string {
  const q = String(quality).toLowerCase();
  
  if (q.includes('2160') || q.includes('4k')) return '4K (2160p)';
  if (q.includes('1440')) return '2K (1440p)';
  if (q.includes('1080')) return 'Full HD (1080p)';
  if (q.includes('720')) return 'HD (720p)';
  if (q.includes('480')) return 'SD (480p)';
  if (q.includes('360')) return '360p';
  if (q.includes('240')) return '240p';
  if (q.includes('144')) return '144p';
  
  return quality || 'Standard';
}

// Helper: Check if quality is HD or higher
function isHDQuality(quality: string): boolean {
  const q = String(quality).toLowerCase();
  return q.includes('1080') || 
         q.includes('1440') || 
         q.includes('2160') || 
         q.includes('4k') || 
         q.includes('720');
}