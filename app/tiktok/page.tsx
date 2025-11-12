'use client';

import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';

interface VideoInfo {
  url?: string;
  title?: string;
  thumbnail?: string;
  duration?: string | number;
  author?: { name?: string; username?: string; avatar?: string };
  stats?: { likes?: number; comments?: number; shares?: number; views?: number; plays?: number };
  downloads?: {
    video?: Array<{ quality?: string; url?: string; format?: string; hasWatermark?: boolean }>;
    audio?: Array<{ quality?: string; url?: string }>;
    images?: string[];
  };
  video?: string;
  videoUrl?: string;
  download?: string;
  videoHD?: string;
  hdVideo?: string;
  videoNoWatermark?: string;
  audio?: string;
  music?: string;
  audioUrl?: string;
  images?: string[];
  cover?: string;
  description?: string;
  username?: string;
  likes?: number;
  views?: number;
  shares?: number;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: VideoInfo;
  result?: VideoInfo;
  error?: string;
}

type DownloadLink = { url: string; label: string; gradient: string; icon: string; type: string };

export default function TikTokDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');

  const formatNum = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

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

      if (data.success === false) {
        setError(data.message || 'Failed to fetch video. Please try again.');
        setIsLoading(false);
        return;
      }

      const videoData = data.data || data.result || data;
      if (!videoData) {
        setError('No video data found. The video might be private or deleted.');
        setIsLoading(false);
        return;
      }

      setVideoInfo(videoData);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError('Network error. Please check your internet connection.');
    }
  };

  const getDownloadLinks = (): DownloadLink[] => {
    if (!videoInfo) return [];
    const links: DownloadLink[] = [];

    // Universal Downloader video format
    videoInfo.downloads?.video?.forEach((item) => {
      if (!item.url) return;
      const isNoWatermark = item.hasWatermark === false;
      const isHD = item.quality?.toLowerCase().includes('hd');
      
      links.push({
        url: item.url,
        label: isNoWatermark ? 'No Watermark' : isHD ? 'HD Video' : `Video ${item.quality || ''}`,
        gradient: isNoWatermark ? 'from-cyan-500 to-blue-500' : isHD ? 'from-pink-500 to-rose-500' : 'from-gray-800 to-gray-900',
        icon: isNoWatermark ? '✨' : '📹',
        type: 'video'
      });
    });

    // Legacy video fields
    const videoFields = [
      { field: 'videoNoWatermark', label: 'No Watermark', gradient: 'from-cyan-500 to-blue-500', icon: '✨' },
      { field: 'videoHD', label: 'HD Video', gradient: 'from-pink-500 to-rose-500', icon: '📹' },
      { field: 'hdVideo', label: 'HD Video', gradient: 'from-pink-500 to-rose-500', icon: '📹' },
      { field: 'video', label: 'Video', gradient: 'from-gray-800 to-gray-900', icon: '📹' },
      { field: 'videoUrl', label: 'Video', gradient: 'from-gray-800 to-gray-900', icon: '📹' },
      { field: 'download', label: 'Video', gradient: 'from-gray-800 to-gray-900', icon: '📹' },
    ];

    videoFields.forEach(({ field, label, gradient, icon }) => {
      const fieldUrl = videoInfo[field];
      if (fieldUrl && !links.some(l => l.url === fieldUrl)) {
        links.push({ url: fieldUrl, label, gradient, icon, type: 'video' });
      }
    });

    // Audio
    videoInfo.downloads?.audio?.forEach((item) => {
      if (item.url) links.push({ url: item.url, label: `Audio ${item.quality || ''}`, gradient: 'from-pink-500 to-rose-500', icon: '🎵', type: 'audio' });
    });

    const audioUrl = videoInfo.audio || videoInfo.music || videoInfo.audioUrl;
    if (audioUrl && !links.some(l => l.url === audioUrl)) {
      links.push({ url: audioUrl, label: 'Audio', gradient: 'from-pink-500 to-rose-500', icon: '🎵', type: 'audio' });
    }

    return links;
  };

  const getImages = () => {
    const images = videoInfo?.downloads?.images || videoInfo?.images;
    return Array.isArray(images) ? images : [];
  };

  const stats = videoInfo?.stats || {};
  const author = videoInfo?.author || {};
  const statsData = [
    { label: 'Likes', value: stats.likes || videoInfo?.likes, icon: '❤️' },
    { label: 'Views', value: stats.views || stats.plays || videoInfo?.views, icon: '👁️' },
    { label: 'Shares', value: stats.shares || videoInfo?.shares, icon: '🔗' },
    { label: 'Comments', value: stats.comments, icon: '💬' },
  ].filter(s => s.value);

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
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden border border-gray-700">
              {(videoInfo.thumbnail || videoInfo.cover) && (
                <img 
                  src={videoInfo.thumbnail || videoInfo.cover} 
                  alt="Video" 
                  className="w-full aspect-[9/16] object-cover"
                />
              )}
              
              <div className="p-5 space-y-3">
                {(videoInfo.title || videoInfo.description) && (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {videoInfo.title || videoInfo.description}
                  </p>
                )}
                
                {(author.username || videoInfo.username) && (
                  <div className="text-sm text-gray-400">
                    @{author.username || videoInfo.username}
                  </div>
                )}

                {/* Stats */}
                {statsData.length > 0 && (
                  <div className="flex gap-4 pt-3 border-t border-gray-700">
                    {statsData.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-sm font-bold">{stat.icon} {formatNum(stat.value!)}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Download Links */}
            <div className="space-y-3">
              {getDownloadLinks().map((link, i) => (
                <a 
                  key={i}
                  href={link.url} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`block bg-gradient-to-r ${link.gradient} text-white text-center font-bold py-4 px-6 rounded-2xl hover:opacity-90 transition-all`}
                >
                  {link.icon} {link.label}
                </a>
              ))}

              {/* Images */}
              {getImages().map((img, i) => (
                <a 
                  key={`img-${i}`}
                  href={img} 
                  download 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center font-bold py-4 px-6 rounded-2xl hover:opacity-90 transition-all"
                >
                  🖼️ Image {i + 1}
                </a>
              ))}

              {getDownloadLinks().length === 0 && getImages().length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-4 text-sm text-yellow-300">
                  <p className="font-bold mb-2">⚠️ No download links found</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer mb-2">Show raw API response</summary>
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
          <h2 className="text-xl font-bold mb-4">How it works</h2>
          <div className="space-y-4 text-sm text-gray-400">
            {[
              'Copy TikTok video URL',
              'Paste it above and click Download',
              'Choose quality and save to device'
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

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-600">
          Powered by Universal Downloader 🚀
        </div>
      </div>
    </main>
  );
} 