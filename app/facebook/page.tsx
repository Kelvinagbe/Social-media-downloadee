'use client';

import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, Video, Music, Image } from 'lucide-react';

interface MediaItem {
  quality?: string;
  url?: string;
  resolution?: string;
  format?: string;
  hasAudio?: boolean;
  text?: string;
}

interface VideoInfo {
  title?: string;
  thumbnail?: string;
  author?: string;
  duration?: string;
  video?: MediaItem[];
  audio?: MediaItem[];
  image?: string[];
  url?: string;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  data?: VideoInfo;
  error?: string;
}

type DownloadLink = { 
  url: string; 
  label: string; 
  gradient: string; 
  icon: React.ReactNode;
  quality?: string;
};

export default function FacebookDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return setError('Please enter a Facebook URL');
    if (!trimmed.includes('facebook.com') && !trimmed.includes('fb.watch')) {
      return setError('Please enter a valid Facebook URL');
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const res = await fetch(`/api/facebook?url=${encodeURIComponent(trimmed)}`);
      const data: ApiResponse = await res.json();

      console.log('API Response:', data);

      if (!data.success) {
        setError(data.error || 'Failed to fetch video. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data.data) {
        setError('No video data found. The video might be private or deleted.');
        setIsLoading(false);
        return;
      }

      console.log('Video Data:', data.data);
      setVideoInfo(data.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error:', err);
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  const getDownloadLinks = (): DownloadLink[] => {
    if (!videoInfo) return [];
    const links: DownloadLink[] = [];

    // Handle video downloads
    if (videoInfo.video && Array.isArray(videoInfo.video)) {
      videoInfo.video.forEach((item) => {
        if (!item.url) return;

        const quality = item.quality || item.resolution || 'Standard';
        const isHD = quality.toLowerCase().includes('hd') || quality.includes('720') || quality.includes('1080');
        
        links.push({
          url: item.url,
          label: `Video - ${quality}`,
          quality: quality,
          gradient: isHD ? 'from-blue-600 to-blue-800' : 'from-blue-500 to-blue-700',
          icon: <Video className="w-5 h-5" />
        });
      });
    }

    // Handle audio downloads
    if (videoInfo.audio && Array.isArray(videoInfo.audio)) {
      videoInfo.audio.forEach((item) => {
        if (!item.url) return;
        
        links.push({
          url: item.url,
          label: `Audio - ${item.quality || 'Standard'}`,
          gradient: 'from-pink-500 to-rose-600',
          icon: <Music className="w-5 h-5" />
        });
      });
    }

    // Handle image downloads (for photo posts)
    if (videoInfo.image && Array.isArray(videoInfo.image)) {
      videoInfo.image.forEach((imgUrl, index) => {
        links.push({
          url: imgUrl,
          label: `Image ${index + 1}`,
          gradient: 'from-purple-500 to-indigo-600',
          icon: <Image className="w-5 h-5" />
        });
      });
    }

    // Fallback: check for direct URL field
    if (links.length === 0 && videoInfo.url) {
      links.push({
        url: videoInfo.url,
        label: 'Download Video',
        gradient: 'from-blue-500 to-blue-700',
        icon: <Video className="w-5 h-5" />
      });
    }

    return links;
  };

  const downloadLinks = getDownloadLinks();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black">Facebook Downloader</h1>
              <p className="text-blue-300 text-sm mt-1">Download videos & photos easily</p>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-slate-700 shadow-xl">
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleDownload()}
            placeholder="Paste Facebook video or photo URL..."
            disabled={isLoading}
            className="w-full bg-slate-900/70 text-white px-5 py-4 rounded-2xl border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400 mb-4 transition-all"
          />
          
          <button 
            onClick={handleDownload} 
            disabled={isLoading || !url.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
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
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="space-y-4 animate-in fade-in duration-500">
            
            {/* Success Badge */}
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2 w-fit">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Media found!</span>
            </div>

            {/* Thumbnail & Info */}
            {(videoInfo.thumbnail || videoInfo.title || videoInfo.author) && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-700 shadow-xl">
                {videoInfo.thumbnail && (
                  <div className="relative">
                    <img 
                      src={videoInfo.thumbnail} 
                      alt="Video thumbnail" 
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  </div>
                )}
                
                <div className="p-5 space-y-2">
                  {videoInfo.title && (
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {videoInfo.title}
                    </h3>
                  )}
                  
                  {videoInfo.author && (
                    <p className="text-sm text-blue-300">
                      By {videoInfo.author}
                    </p>
                  )}

                  {videoInfo.duration && (
                    <p className="text-xs text-slate-400">
                      Duration: {videoInfo.duration}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Download Links */}
            <div className="space-y-3">
              {downloadLinks.map((link, i) => (
                <a 
                  key={i}
                  href={link.url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`group block bg-gradient-to-r ${link.gradient} text-white font-bold py-4 px-6 rounded-2xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {link.icon}
                      <span>{link.label}</span>
                    </div>
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </a>
              ))}

              {downloadLinks.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-4 text-sm text-yellow-300 backdrop-blur-sm">
                  <p className="font-bold mb-2">⚠️ No download links found</p>
                  <p className="mb-3 text-yellow-200">The video might be private or unavailable.</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer mb-2 hover:text-yellow-100">Show API response</summary>
                    <pre className="bg-slate-900/70 p-3 rounded overflow-auto max-h-64 text-slate-300 text-xs">
                      {JSON.stringify(videoInfo, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              ℹ️
            </div>
            How to use
          </h2>
          <div className="space-y-4 text-sm text-slate-300">
            {[
              'Open Facebook and find the video or photo you want',
              'Copy the URL from your browser',
              'Paste it here and click Download',
              'Choose your preferred quality and save'
            ].map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                  {i + 1}
                </div>
                <div className="pt-1">{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { icon: '⚡', text: 'Fast & Easy', color: 'from-yellow-500 to-orange-500' },
            { icon: '🎬', text: 'HD Quality', color: 'from-blue-500 to-cyan-500' },
            { icon: '🔒', text: 'Secure', color: 'from-green-500 to-emerald-500' },
            { icon: '📱', text: 'All Devices', color: 'from-purple-500 to-pink-500' }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center hover:border-slate-600 transition-colors">
              <div className={`text-2xl mb-2 inline-block bg-gradient-to-br ${feature.color} bg-clip-text text-transparent font-bold`}>
                {feature.icon}
              </div>
              <div className="text-sm text-slate-300 font-medium">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500">
          <p>Powered by MetaDownloader 🚀</p>
          <p className="mt-1">For personal use only • Respect content creators</p>
        </div>
      </div>
    </main>
  );
}