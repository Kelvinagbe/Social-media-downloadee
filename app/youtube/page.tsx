'use client' 

import React, { useState } from 'react';
import { Download, Loader2, Check, AlertCircle, Info, ExternalLink, Play, Music, Film, Clock } from 'lucide-react';

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

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState('');
  const [showRawData, setShowRawData] = useState(false);

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return setError('Please enter a YouTube URL');
    if (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be')) {
      return setError('Please enter a valid YouTube URL');
    }

    setIsLoading(true);
    setError('');
    setVideoInfo(null);
    setShowRawData(false);

    try {
      const res = await fetch(`/api/youtube?url=${encodeURIComponent(trimmed)}`);
      const data: ApiResponse = await res.json();

      console.log('API Response:', data);

      if (!data.success) {
        setError(data.error || 'Failed to fetch video. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data.data) {
        setError('No video data found. The video might be private, age-restricted, or deleted.');
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

  const videoDownloads = downloadLinks.filter(link => 
    !link.text.toLowerCase().includes('audio') && !link.text.includes('🎵')
  );
  const audioDownloads = downloadLinks.filter(link => 
    link.text.toLowerCase().includes('audio') || link.text.includes('🎵')
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/50">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">YouTube Downloader</h1>
              <p className="text-red-300 text-sm mt-1">Download videos in any quality</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 mb-6 border border-slate-700 shadow-xl">
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleDownload()}
            placeholder="Paste YouTube video URL here..."
            disabled={isLoading}
            className="w-full bg-slate-900/70 text-white px-5 py-4 rounded-2xl border border-slate-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 placeholder-slate-400 mb-4 transition-all"
          />

          <button 
            onClick={handleDownload} 
            disabled={isLoading || !url.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching video...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Get Download Links
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3 backdrop-blur-sm animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {videoInfo && (
          <div className="space-y-4 animate-in fade-in duration-500">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Video found!</span>
              </div>

              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center gap-2 text-slate-400 text-xs bg-slate-800/50 border border-slate-600 rounded-xl px-3 py-2 hover:bg-slate-700/50 transition-colors"
              >
                <Info className="w-4 h-4" />
                {showRawData ? 'Hide' : 'Show'} Raw Data
              </button>
            </div>

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
                  
                  {videoInfo.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {videoInfo.duration}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 space-y-3">
                {videoInfo.title && (
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {videoInfo.title}
                  </h3>
                )}

                {videoInfo.author && (
                  <p className="text-sm text-red-300 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    {videoInfo.author}
                  </p>
                )}
              </div>
            </div>

            {videoDownloads.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Film className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Video Downloads</h3>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{videoDownloads.length}</span>
                </div>

                <div className="grid gap-3">
                  {videoDownloads.map((link, i) => {
                    const isHD = link.text.includes('🎬') || 
                                link.text.includes('1080') || 
                                link.text.includes('1440') || 
                                link.text.includes('2160') || 
                                link.text.includes('4K') ||
                                link.text.includes('720');
                    
                    const is4K = link.text.includes('4K') || link.text.includes('2160');
                    
                    let gradient = 'from-blue-500 to-blue-700';
                    if (is4K) gradient = 'from-purple-600 to-purple-800';
                    else if (isHD) gradient = 'from-blue-600 to-blue-800';

                    return (
                      <a 
                        key={i}
                        href={link.url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`group block bg-gradient-to-r ${gradient} text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
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
                  })}
                </div>
              </div>
            )}

            {audioDownloads.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Music className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Audio Only</h3>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{audioDownloads.length}</span>
                </div>

                <div className="grid gap-3">
                  {audioDownloads.map((link, i) => (
                    <a 
                      key={i}
                      href={link.url} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
                  ))}
                </div>
              </div>
            )}

            {downloadLinks.length === 0 && (
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
                    <li>The video is age-restricted or requires login</li>
                    <li>The video is private or members-only</li>
                    <li>The video has download restrictions</li>
                    <li>Regional restrictions apply</li>
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
        )}

        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-3xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-lg">
              ℹ️
            </div>
            How to use
          </h2>
          <div className="space-y-4 text-sm text-slate-300">
            {[
              'Go to YouTube and find the video you want to download',
              'Copy the video URL from your browser address bar',
              'Paste the URL here and click "Get Download Links"',
              'Choose your preferred quality (4K, HD, SD) or audio format',
              'Click download and enjoy your video offline!'
            ].map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                  {i + 1}
                </div>
                <div className="pt-1">{text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '⚡', text: 'Lightning Fast', color: 'from-yellow-500 to-orange-500' },
            { icon: '🎬', text: 'Up to 4K', color: 'from-purple-500 to-pink-500' },
            { icon: '🎵', text: 'Audio Only', color: 'from-pink-500 to-rose-500' },
            { icon: '📱', text: 'All Devices', color: 'from-blue-500 to-cyan-500' }
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700 text-center hover:border-slate-600 transition-colors">
              <div className={`text-2xl mb-2 inline-block bg-gradient-to-br ${feature.color} bg-clip-text text-transparent font-bold`}>
                {feature.icon}
              </div>
              <div className="text-sm text-slate-300 font-medium">{feature.text}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-xs text-slate-500">
          <p>Powered by UniversalDownloader 🚀</p>
          <p className="mt-1">For personal use only • Respect content creators & copyright</p>
        </div>
      </div>
    </main>
  );
}