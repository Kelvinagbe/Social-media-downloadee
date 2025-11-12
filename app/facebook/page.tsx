'use client' 

import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';

interface VideoInfo {
  title?: string;
  thumbnail?: string;
  author?: string;
  duration?: string;
  downloads?: Array<{ text: string; url: string }>;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  status?: number;
  message?: string;
  data?: VideoInfo;
  error?: string;
  debug?: any;
}

export default function FacebookDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');
  const [showRawData, setShowRawData] = useState(false);

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return setError('Please enter a Facebook URL');
    if (!trimmed.includes('facebook.com') && !trimmed.includes('fb.watch')) {
      return setError('Please enter a valid Facebook URL');
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);
    setShowRawData(false);

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

  const downloadLinks = videoInfo?.downloads || [];

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Media found!</span>
              </div>

              {/* Debug Toggle Button */}
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center gap-2 text-slate-400 text-xs bg-slate-800/50 border border-slate-600 rounded-xl px-3 py-2 hover:bg-slate-700/50 transition-colors"
              >
                <Info className="w-4 h-4" />
                {showRawData ? 'Hide' : 'Show'} Raw Data
              </button>
            </div>

            {/* Raw Data Display (for debugging) */}
            {showRawData && (
              <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-300">Debug: API Response</span>
                </div>
                <pre className="text-xs text-slate-300 overflow-auto max-h-96 bg-slate-950/50 p-4 rounded-xl">
                  {JSON.stringify(videoInfo, null, 2)}
                </pre>
              </div>
            )}

            {/* Thumbnail & Info */}
            {(videoInfo.thumbnail || videoInfo.title || videoInfo.author) && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-700 shadow-xl">
                {videoInfo.thumbnail && (
                  <div className="relative">
                    <img 
                      src={videoInfo.thumbnail} 
                      alt="Video thumbnail" 
                      className="w-full aspect-video object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
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
              {downloadLinks.length > 0 ? (
                downloadLinks.map((link, i) => {
                  const isHD = link.text.toLowerCase().includes('hd') || link.text.includes('🎬');
                  const isImage = link.text.toLowerCase().includes('image') || link.text.includes('📸');
                  const isAudio = link.text.toLowerCase().includes('audio') || link.text.includes('🎵');
                  
                  let gradient = 'from-blue-500 to-blue-700';
                  if (isHD) gradient = 'from-blue-600 to-blue-800';
                  if (isImage) gradient = 'from-purple-500 to-indigo-600';
                  if (isAudio) gradient = 'from-pink-500 to-rose-600';

                  return (
                    <a 
                      key={i}
                      href={link.url} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`group block bg-gradient-to-r ${gradient} text-white font-bold py-4 px-6 rounded-2xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {link.text}
                        </span>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 opacity-70" />
                          <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-4 text-sm text-yellow-300 backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">No download links found</p>
                      <p className="text-yellow-200">The API returned data but no downloadable URLs were detected.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-3 space-y-2 text-xs">
                    <p className="text-slate-300 font-semibold">Possible reasons:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>The video is private or restricted</li>
                      <li>The URL format is not supported</li>
                      <li>The API response structure is different than expected</li>
                      <li>The content has been deleted or removed</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowRawData(true)}
                    className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 underline flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    Click "Show Raw Data" above to see the API response
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-lg">
              ℹ️
            </div>
            How to use
          </h2>
          <div className="space-y-4 text-sm text-slate-300">
            {[
              'Open Facebook and find the video or photo you want',
              'Copy the URL from your browser address bar',
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
          <p>Powered by UniversalDownloader 🚀</p>
          <p className="mt-1">For personal use only • Respect content creators</p>
        </div>
      </div>
    </main>
  );
}