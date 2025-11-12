'use client';

import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';

interface VideoInfo {
  title?: string;
  thumbnail?: string;
  downloads?: Array<{ text: string; url: string }>; // Universal Downloader format
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: VideoInfo;
  error?: string;
}

type DownloadLink = { url: string; label: string; gradient: string; icon: string; type: string };

export default function TikTokDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return setError('Please enter a TikTok URL');
    if (!trimmed.includes('tiktok.com')) return setError('Please enter a valid TikTok URL');

    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const res = await fetch(`/api/tiktok?url=${encodeURIComponent(trimmed)}`);
      const data: ApiResponse = await res.json();

      console.log('API Response:', data);

      if (data.success === false) {
        setError(data.message || 'Failed to fetch video. Please try again.');
        setIsLoading(false);
        return;
      }

      const videoData = data.data;
      if (!videoData) {
        setError('No video data found. The video might be private or deleted.');
        setIsLoading(false);
        return;
      }

      console.log('Video Data:', videoData);
      setVideoInfo(videoData);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error:', err);
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  const getDownloadLinks = (): DownloadLink[] => {
    if (!videoInfo || !videoInfo.downloads) return [];
    const links: DownloadLink[] = [];

    // Universal Downloader format: array of {text, url}
    videoInfo.downloads.forEach((item) => {
      if (!item.url || !item.text) return;

      const textLower = item.text.toLowerCase();
      
      // Determine type and styling based on text
      if (textLower.includes('mp3') || textLower.includes('audio')) {
        links.push({
          url: item.url,
          label: item.text,
          gradient: 'from-pink-500 to-rose-500',
          icon: '🎵',
          type: 'audio'
        });
      } else if (textLower.includes('hd')) {
        links.push({
          url: item.url,
          label: item.text,
          gradient: 'from-purple-500 to-pink-500',
          icon: '✨',
          type: 'video'
        });
      } else if (textLower.includes('mp4') || textLower.includes('video')) {
        links.push({
          url: item.url,
          label: item.text,
          gradient: 'from-cyan-500 to-blue-500',
          icon: '📹',
          type: 'video'
        });
      } else {
        // Generic download
        links.push({
          url: item.url,
          label: item.text,
          gradient: 'from-gray-700 to-gray-900',
          icon: '⬇️',
          type: 'other'
        });
      }
    });

    return links;
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-pink-400 to-yellow-400 rounded-2xl flex items-center justify-center transform rotate-12">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-black">TikTok Downloader</h1>
          </div>
          <p className="text-gray-400 text-sm">Download videos without watermark</p>
        </div>

        {/* Input Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 mb-6 border border-gray-700">
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleDownload()}
            placeholder="Paste TikTok URL here..."
            disabled={isLoading}
            className="w-full bg-black/40 text-white px-5 py-4 rounded-2xl border border-gray-700 focus:border-cyan-400 focus:outline-none placeholder-gray-500 mb-4 transition-all"
          />
          
          <button 
            onClick={handleDownload} 
            disabled={isLoading || !url.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="space-y-4 animate-in fade-in duration-500">
            
            {/* Success Badge */}
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Video found!</span>
            </div>

            {/* Thumbnail & Info */}
            {(videoInfo.thumbnail || videoInfo.title) && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden border border-gray-700">
                {videoInfo.thumbnail && (
                  <img 
                    src={videoInfo.thumbnail} 
                    alt="Video" 
                    className="w-full aspect-[9/16] object-cover"
                  />
                )}
                
                {videoInfo.title && (
                  <div className="p-5">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {videoInfo.title}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Download Links */}
            <div className="space-y-3">
              {getDownloadLinks().map((link, i) => (
                <a 
                  key={i}
                  href={link.url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block bg-gradient-to-r ${link.gradient} text-white text-center font-bold py-4 px-6 rounded-2xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <span className="text-xl mr-2">{link.icon}</span>
                  {link.label}
                </a>
              ))}

              {getDownloadLinks().length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-4 text-sm text-yellow-300">
                  <p className="font-bold mb-2">⚠️ No download links found</p>
                  <p className="mb-3 text-yellow-200">The API returned data but no downloads are available.</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer mb-2 hover:text-yellow-100">Show raw API response</summary>
                    <pre className="bg-black/50 p-3 rounded overflow-auto max-h-64 text-gray-300">
                      {JSON.stringify(videoInfo, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">✨ How it works</h2>
          <div className="space-y-4 text-sm text-gray-400">
            {[
              'Copy any TikTok video URL',
              'Paste it above and click Download',
              'Choose your preferred quality (HD, MP4, or MP3)'
            ].map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-pink-400 rounded-full flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="pt-0.5">{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
          {[
            { icon: '⚡', text: 'Fast downloads' },
            { icon: '🎬', text: 'HD quality' },
            { icon: '🎵', text: 'Audio extraction' },
            { icon: '🔒', text: 'No watermark' }
          ].map((feature, i) => (
            <div key={i} className="bg-gray-900/50 rounded-xl p-3 border border-gray-800 text-center">
              <div className="text-lg mb-1">{feature.icon}</div>
              <div className="text-gray-400">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-600">
          Powered by Universal Downloader API 🚀
        </div>
      </div>
    </main>
  );
}