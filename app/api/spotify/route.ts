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
      if (response.ok || response.status === 404) return response; // Don't retry 404s
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

    // Validate Spotify URL
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

    // Call your backend endpoint with retry logic
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