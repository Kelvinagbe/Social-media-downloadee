'use client';

import React, { useState } from 'react';
import { Download, Sparkles, Loader2, Check, AlertCircle, Zap, Shield } from 'lucide-react';

interface VideoInfo {
  // Universal Downloader response structure
  url?: string;
  title?: string;
  thumbnail?: string;
  duration?: string | number;
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
  stats?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    plays?: number;
  };
  downloads?: {
    video?: Array<{
      quality?: string;
      url?: string;
      format?: string;
      hasWatermark?: boolean;
    }>;
    audio?: Array<{
      quality?: string;
      url?: string;
    }>;
    images?: string[];
  };
  // Fallback fields for backward compatibility
  cover?: string;
  description?: string;
  username?: string;
  likes?: number;
  views?: number;
  shares?: number;
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
}

interface ApiResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: VideoInfo;
  result?: VideoInfo;
  error?: string;
}

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

    // Validation
    if (!trimmed) {
      setError('Please enter a TikTok URL');
      return;
    }

    if (!trimmed.includes('tiktok.com')) {
      setError('Please enter a valid TikTok URL (e.g., https://www.tiktok.com/... or https://vm.tiktok.com/...)');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      // Call our Next.js API route
      const apiUrl = `/api/tiktok?url=${encodeURIComponent(trimmed)}`;

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data: ApiResponse = await res.json();

      console.log('API Response:', data);

      setIsLoading(false);

      // Handle error responses
      if (data.success === false) {
        setError(data.message || 'Failed to fetch video. Please try again.');
        return;
      }

      // Get video info from either data or result field
      const videoData = data.data || data.result;

      // Check if we have valid result data
      if (!videoData || videoData === null) {
        setError('No video data found. The video might be private, deleted, region-restricted, or the URL might be invalid. Try copying the URL again from TikTok.');
        return;
      }

      // Success - display video info
      setVideoInfo(videoData);

    } catch (err: any) {
      setIsLoading(false);
      console.error('Fetch error:', err);

      if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again or try a different video URL.');
      }
    }
  };

  // Helper function to get author info
  const getAuthorInfo = () => {
    if (videoInfo?.author) {
      return {
        name: videoInfo.author.name || videoInfo.author.username,
        username: videoInfo.author.username
      };
    }
    return {
      name: videoInfo?.username,
      username: videoInfo?.username
    };
  };

  // Helper function to get stats
  const getStats = () => {
    if (videoInfo?.stats) {
      return {
        likes: videoInfo.stats.likes,
        views: videoInfo.stats.views || videoInfo.stats.plays,
        shares: videoInfo.stats.shares,
        comments: videoInfo.stats.comments
      };
    }
    return {
      likes: videoInfo?.likes,
      views: videoInfo?.views,
      shares: videoInfo?.shares
    };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="text-sm font-semibold text-black">Fast & Reliable</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-black">
            TikTok Downloader
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save videos, audio, and images from TikTok. Fast, free, and easy to use.
          </p>
        </div>

        {/* Main Download Card */}
        <div className="bg-white border-2 border-black rounded-2xl p-8 mb-8 shadow-lg">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-black">
                Enter TikTok Video URL
              </label>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleDownload()}
                placeholder="https://www.tiktok.com/@username/video/... or https://vm.tiktok.com/..."
                disabled={isLoading}
                className="w-full px-5 py-4 bg-white border-2 border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:border-black focus:ring-4 focus:ring-black/10 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                💡 Paste any TikTok video URL and press Enter or click the button below
              </p>
            </div>

            <button 
              onClick={handleDownload} 
              disabled={isLoading || !url.trim()}
              className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-3 text-base shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Video...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Get Download Links</span>
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-700 mb-2">{error}</p>
                <p className="text-xs text-red-600">
                  💡 <strong>Tips:</strong> Make sure the video is public, not age-restricted, and the URL is correct.
                </p>
              </div>
            </div>
          )}

          {/* Video Info Display */}
          {videoInfo && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b-2 border-gray-100">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black">Video Found!</h3>
              </div>

              {/* Thumbnail */}
              {(videoInfo.thumbnail || videoInfo.cover) && (
                <div className="mb-6">
                  <img 
                    src={videoInfo.thumbnail || videoInfo.cover} 
                    alt="Video Thumbnail" 
                    className="w-full max-w-md mx-auto rounded-xl border-2 border-gray-200 shadow-md" 
                  />
                </div>
              )}

              {/* Video Details */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 space-y-3 text-sm border border-gray-200">
                {(videoInfo.title || videoInfo.description) && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[90px]">Description:</span>
                    <span className="text-gray-900">{videoInfo.title || videoInfo.description}</span>
                  </div>
                )}
                {getAuthorInfo().username && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[90px]">Author:</span>
                    <span className="text-gray-900">@{getAuthorInfo().username}</span>
                  </div>
                )}
                {videoInfo.duration && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[90px]">Duration:</span>
                    <span className="text-gray-900">{videoInfo.duration} seconds</span>
                  </div>
                )}
                
                {/* Stats Grid */}
                {(() => {
                  const stats = getStats();
                  const hasStats = stats.likes || stats.views || stats.shares || stats.comments;
                  
                  if (!hasStats) return null;
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-300">
                      {stats.likes && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-black">❤️ {formatNum(stats.likes)}</div>
                          <div className="text-xs text-gray-600">Likes</div>
                        </div>
                      )}
                      {stats.views && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-black">👁️ {formatNum(stats.views)}</div>
                          <div className="text-xs text-gray-600">Views</div>
                        </div>
                      )}
                      {stats.shares && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-black">🔄 {formatNum(stats.shares)}</div>
                          <div className="text-xs text-gray-600">Shares</div>
                        </div>
                      )}
                      {stats.comments && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-black">💬 {formatNum(stats.comments)}</div>
                          <div className="text-xs text-gray-600">Comments</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Download Links */}
              <div className="space-y-3">
                <h4 className="font-semibold text-black mb-3">Download Options:</h4>

                {/* Universal Downloader format - video downloads */}
                {videoInfo.downloads?.video && videoInfo.downloads.video.length > 0 && (
                  <>
                    {videoInfo.downloads.video.map((item, index) => {
                      const isHD = item.quality?.toLowerCase().includes('hd') || item.quality?.toLowerCase().includes('high');
                      const isNoWatermark = item.hasWatermark === false;
                      
                      let label = 'Download Video';
                      let gradient = 'from-purple-600 to-blue-600';
                      let icon = '📥';
                      
                      if (isNoWatermark) {
                        label = 'Download Video (No Watermark)';
                        gradient = 'from-green-600 to-emerald-600';
                        icon = '🎬';
                      } else if (isHD) {
                        label = 'Download HD Video';
                        gradient = 'from-blue-600 to-cyan-600';
                        icon = '✨';
                      } else if (item.quality) {
                        label = `Download Video (${item.quality})`;
                      }
                      
                      return (
                        <a 
                          key={index}
                          href={item.url} 
                          download 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`block w-full bg-gradient-to-r ${gradient} text-white text-center font-semibold py-4 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md`}
                        >
                          {icon} {label}
                        </a>
                      );
                    })}
                  </>
                )}

                {/* Fallback to old format if universal format not available */}
                {!videoInfo.downloads?.video && (
                  <>
                    {(videoInfo.video || videoInfo.videoUrl || videoInfo.download) && (
                      <a 
                        href={videoInfo.video || videoInfo.videoUrl || videoInfo.download} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 active:scale-95 transition-all shadow-md"
                      >
                        📥 Download Video (With Watermark)
                      </a>
                    )}

                    {(videoInfo.videoHD || videoInfo.hdVideo) && (
                      <a 
                        href={videoInfo.videoHD || videoInfo.hdVideo} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-cyan-700 active:scale-95 transition-all shadow-md"
                      >
                        ✨ Download HD Video
                      </a>
                    )}

                    {videoInfo.videoNoWatermark && (
                      <a 
                        href={videoInfo.videoNoWatermark} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all shadow-md"
                      >
                        🎬 Download Video (No Watermark)
                      </a>
                    )}
                  </>
                )}

                {/* Universal Downloader format - audio downloads */}
                {videoInfo.downloads?.audio && videoInfo.downloads.audio.length > 0 && (
                  <>
                    {videoInfo.downloads.audio.map((item, index) => (
                      <a 
                        key={index}
                        href={item.url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:from-pink-700 hover:to-rose-700 active:scale-95 transition-all shadow-md"
                      >
                        🎵 Download Audio {item.quality ? `(${item.quality})` : 'Only'}
                      </a>
                    ))}
                  </>
                )}

                {/* Fallback audio format */}
                {!videoInfo.downloads?.audio && (videoInfo.audio || videoInfo.music || videoInfo.audioUrl) && (
                  <a 
                    href={videoInfo.audio || videoInfo.music || videoInfo.audioUrl} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-center font-semibold py-4 px-6 rounded-xl hover:from-pink-700 hover:to-rose-700 active:scale-95 transition-all shadow-md"
                  >
                    🎵 Download Audio Only
                  </a>
                )}

                {/* Images - check both new and old format */}
                {(() => {
                  const images = videoInfo.downloads?.images || videoInfo.images;
                  if (images && Array.isArray(images) && images.length > 0) {
                    return (
                      <div className="space-y-2 pt-2">
                        <p className="text-sm font-semibold text-gray-700">Photo Slideshow Images:</p>
                        {images.map((img: string, i: number) => (
                          <a 
                            key={i}
                            href={img} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white text-center font-semibold py-3 px-6 rounded-xl hover:from-amber-700 hover:to-orange-700 active:scale-95 transition-all shadow-md"
                          >
                            🖼️ Download Image {i + 1}
                          </a>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Download videos in seconds with our optimized servers.', color: 'bg-yellow-500' },
            { icon: Shield, title: 'Safe & Secure', desc: "Your privacy matters. We don't store any data.", color: 'bg-blue-500' },
            { icon: Sparkles, title: 'HD Quality', desc: 'Get the best available quality, including HD options.', color: 'bg-purple-500' }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="border-2 border-black bg-white rounded-xl p-6 hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-black mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="border-2 border-black bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-black">How it works</h2>
          <div className="space-y-5">
            {[
              { title: 'Copy the URL', desc: 'Open TikTok, find the video you want, and copy its URL from your browser or the share menu.' },
              { title: 'Paste URL here', desc: 'Paste the URL in the input field above and click "Get Download Links" or press Enter.' },
              { title: 'Save to device', desc: 'Choose your preferred quality and format, then download instantly to your device.' }
            ].map(({ title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-base font-bold shadow-md">
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-base font-semibold mb-1 text-black">{title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Universal Downloader 🚀</p>
        </div>

      </div>
    </main>
  );
}