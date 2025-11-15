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

    if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('instagram.com')) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid Facebook or Instagram URL' },
        { status: 400 }
      );
    }

    console.log('📥 Fetching media for URL:', url);

    const apiUrl = `${API_BASE}/api/meta/download?url=${encodeURIComponent(url)}`;
    console.log('🔗 Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(30000),
    });

    console.log('📊 API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend API error ${response.status}:`, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch media (Status: ${response.status}). The video might be private or unavailable.` 
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    console.log('📦 Raw API Response:', JSON.stringify(data, null, 2));

    // Check if the external API returned an error in its response
    if (data.data && data.data.status === false) {
      console.error('❌ External API Error:', data.data.msg);
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${data.data.msg || 'The external API encountered an error processing this URL. Try a different URL or try again later.'}`,
          debug: process.env.NODE_ENV === 'development' ? { 
            apiResponse: data 
          } : undefined
        },
        { status: 200 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Failed to fetch media data' 
        },
        { status: 200 }
      );
    }

    // Transform metadownloader response
    const transformedData = transformMetadownloaderResponse(data.data);

    if (!transformedData || !transformedData.downloads || transformedData.downloads.length === 0) {
      console.error('❌ No downloadable media found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Media found but no download URLs available. The video might be private or region-restricted.',
          debug: process.env.NODE_ENV === 'development' ? { 
            rawData: data.data,
            transformedData 
          } : undefined
        },
        { status: 200 }
      );
    }

    console.log('✅ Success! Found', transformedData.downloads.length, 'download options');

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
    console.error('❌ Facebook API Error:', error);

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

    // Create GET request internally
    const newRequest = new NextRequest(
      `${request.nextUrl.origin}/api/facebook?url=${encodeURIComponent(url)}`,
      { method: 'GET' }
    );

    return GET(newRequest);

  } catch (error: any) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 200 }
    );
  }
}

/**
 * Transform metadownloader package response to Universal Downloader format
 * 
 * Expected input format (from metadownloader npm package):
 * {
 *   title: string,
 *   thumbnail: string,
 *   medias: [{ url: string, quality: string, extension: string, size: string }]
 * }
 * 
 * Output format: 
 * { 
 *   title: string, 
 *   thumbnail: string, 
 *   downloads: [{ text: string, url: string }] 
 * }
 */
function transformMetadownloaderResponse(data: any) {
  if (!data || typeof data !== 'object') {
    console.error('❌ Invalid data: null, undefined, or not an object');
    return null;
  }

  console.log('🔄 Starting transformation...');
  console.log('📋 Available keys:', Object.keys(data));

  const result: any = {
    title: data.title || data.caption || data.description || 'Social Media Video',
    thumbnail: data.thumbnail || data.thumb || data.image || data.picture || '',
    author: data.author || data.username || data.owner || '',
    duration: data.duration || '',
    downloads: [],
  };

  // ============================================
  // PRIORITY 1: Handle medias array (Standard metadownloader format)
  // ============================================
  if (data.medias && Array.isArray(data.medias) && data.medias.length > 0) {
    console.log('✅ Found medias array:', data.medias.length, 'items');
    
    data.medias.forEach((media: any, index: number) => {
      console.log(`  📹 Media ${index + 1}:`, {
        url: media.url ? media.url.substring(0, 50) + '...' : 'NO URL',
        quality: media.quality,
        extension: media.extension,
        size: media.size
      });

      if (media.url && typeof media.url === 'string' && media.url.startsWith('http')) {
        const quality = media.quality || media.resolution || 'Standard';
        const size = media.size ? ` (${media.size})` : '';
        const extension = media.extension ? ` .${media.extension}` : '';
        
        const isHD = quality.toLowerCase().includes('hd') || 
                     quality.toLowerCase().includes('high') ||
                     quality.includes('720') || 
                     quality.includes('1080') ||
                     quality.includes('2160');

        result.downloads.push({
          text: `${quality}${extension}${size}${isHD ? ' 🎬' : ''}`,
          url: media.url,
        });
      } else {
        console.warn(`  ⚠️ Media ${index + 1} has invalid or missing URL`);
      }
    });
  } else {
    console.warn('⚠️ No medias array found or it\'s empty');
  }

  // ============================================
  // PRIORITY 2: Handle direct URL fields (Fallback)
  // ============================================
  const urlFields = [
    { key: 'url', label: 'Download' },
    { key: 'video_url', label: 'Video' },
    { key: 'videoUrl', label: 'Video' },
    { key: 'download_url', label: 'Download' },
    { key: 'downloadUrl', label: 'Download' },
    { key: 'hd', label: 'HD Quality 🎬' },
    { key: 'sd', label: 'SD Quality' },
    { key: 'hdUrl', label: 'HD Quality 🎬' },
    { key: 'sdUrl', label: 'SD Quality' },
  ];

  urlFields.forEach(({ key, label }) => {
    if (data[key] && typeof data[key] === 'string' && data[key].startsWith('http')) {
      const isDuplicate = result.downloads.some((d: any) => d.url === data[key]);
      if (!isDuplicate) {
        console.log(`✅ Found URL in field: ${key}`);
        result.downloads.push({ text: label, url: data[key] });
      }
    }
  });

  // ============================================
  // PRIORITY 3: Handle links/urls array (Alternative format)
  // ============================================
  const linkArrayFields = ['links', 'urls', 'videos', 'qualities'];
  
  for (const field of linkArrayFields) {
    if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
      console.log(`✅ Found ${field} array:`, data[field].length, 'items');
      
      data[field].forEach((item: any, index: number) => {
        const url = typeof item === 'string' ? item : item.url || item.link;
        const quality = typeof item === 'object' ? item.quality || item.label : null;
        
        if (url && url.startsWith('http')) {
          const isDuplicate = result.downloads.some((d: any) => d.url === url);
          if (!isDuplicate) {
            result.downloads.push({
              text: quality || `Quality ${index + 1}`,
              url: url,
            });
          }
        }
      });
      break; // Only use first found array field
    }
  }

  // ============================================
  // PRIORITY 4: Handle images (For photo posts)
  // ============================================
  const imageFields = ['images', 'photos', 'pictures'];
  
  for (const field of imageFields) {
    if (data[field] && Array.isArray(data[field]) && data[field].length > 0) {
      console.log(`✅ Found ${field} array:`, data[field].length, 'images');
      
      data[field].forEach((img: any, index: number) => {
        const imgUrl = typeof img === 'string' ? img : img.url || img.src;
        if (imgUrl && imgUrl.startsWith('http')) {
          result.downloads.push({
            text: `Image ${index + 1} 📸`,
            url: imgUrl,
          });
        }
      });
      break;
    }
  }

  // Single image fallback
  if (result.downloads.length === 0 && (data.image || data.picture)) {
    const imgUrl = data.image || data.picture;
    if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
      console.log('✅ Found single image field');
      result.downloads.push({
        text: 'Download Image 📸',
        url: imgUrl,
      });
    }
  }

  // ============================================
  // PRIORITY 5: Handle audio (If available)
  // ============================================
  if (data.audio) {
    const audioUrl = typeof data.audio === 'string' ? data.audio : data.audio.url;
    if (audioUrl && audioUrl.startsWith('http')) {
      console.log('✅ Found audio');
      result.downloads.push({
        text: 'Audio Only 🎵',
        url: audioUrl,
      });
    }
  }

  // ============================================
  // Final validation and logging
  // ============================================
  console.log('📊 Transformation Complete:');
  console.log(`  ✅ Downloads found: ${result.downloads.length}`);
  
  if (result.downloads.length > 0) {
    console.log('  📥 Download options:');
    result.downloads.forEach((d: any, i: number) => {
      console.log(`    ${i + 1}. ${d.text}`);
    });
  } else {
    console.error('  ❌ NO DOWNLOADS FOUND!');
    console.error('  📦 Raw data structure:', JSON.stringify(data, null, 2));
  }

  return result.downloads.length > 0 ? result : null;
}