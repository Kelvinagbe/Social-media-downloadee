'use client';

import React, { useState } from 'react';
import { Download, Sparkles, Loader2, Check, AlertCircle, Zap, Shield } from 'lucide-react';

export default function TikTokPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState('');

  const formatNum = (n: number) => 
    n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : n.toString();

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return setError('Please enter a valid URL');

    setIsLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const res = await fetch(`https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setIsLoading(false);

      if (!data.success || data.status !== 200) {
        setError(data.message || 'Failed to fetch video');
      } else if (data.result) {
        setVideoInfo(data.result);
      } else {
        setError('No video found. May be private or unavailable.');
      }
    } catch {
      setIsLoading(false);
      setError('Network error. Check connection and retry.');
    }
  };

  return (
    <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full mb-4">
            <Sparkles className="w-3 h-3 text-black" />
            <span className="text-xs font-medium text-black">Fast & Reliable</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-black">
            Download from TikTok
          </h1>
          <p className="text-lg text-gray-600">
            Save videos, audio, and images from TikTok. Fast, free, and easy to use.
          </p>
        </div>

        {/* Download Card */}
        <div className="bg-white border-2 border-black rounded-xl p-8 mb-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Enter URL</label>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                placeholder="https://www.tiktok.com/..."
                className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-20 text-sm"
              />
            </div>

            <button 
              onClick={handleDownload} 
              disabled={isLoading}
              className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Video</span>
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Video Info */}
          {videoInfo && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Video Found!</h3>
              </div>

              {(videoInfo.thumbnail || videoInfo.cover) && (
                <img 
                  src={videoInfo.thumbnail || videoInfo.cover} 
                  alt="Thumbnail" 
                  className="w-full rounded-lg mb-4 border-2 border-gray-200" 
                />
              )}

              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                {(videoInfo.title || videoInfo.description) && (
                  <p><strong>Description:</strong> {videoInfo.title || videoInfo.description}</p>
                )}
                {(videoInfo.author || videoInfo.username) && (
                  <p><strong>Author:</strong> @{videoInfo.author || videoInfo.username}</p>
                )}
                {videoInfo.duration && <p><strong>Duration:</strong> {videoInfo.duration}s</p>}
                {videoInfo.likes && <p><strong>Likes:</strong> {formatNum(videoInfo.likes)}</p>}
                {videoInfo.views && <p><strong>Views:</strong> {formatNum(videoInfo.views)}</p>}
                {videoInfo.shares && <p><strong>Shares:</strong> {formatNum(videoInfo.shares)}</p>}
              </div>

              <div className="space-y-2">
                {(videoInfo.video || videoInfo.videoUrl || videoInfo.download) && (
                  <a 
                    href={videoInfo.video || videoInfo.videoUrl || videoInfo.download} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-black text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-gray-800"
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
                    className="block w-full bg-black text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-gray-800"
                  >
                    📥 Download HD Video
                  </a>
                )}
                {videoInfo.videoWatermark === false && videoInfo.videoNoWatermark && (
                  <a 
                    href={videoInfo.videoNoWatermark} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-black text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-gray-800"
                  >
                    📥 Download Video (No Watermark)
                  </a>
                )}
                {(videoInfo.audio || videoInfo.music || videoInfo.audioUrl) && (
                  <a 
                    href={videoInfo.audio || videoInfo.music || videoInfo.audioUrl} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-gray-900 text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-gray-800"
                  >
                    🎵 Download Audio Only
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Download in seconds with optimized servers.' },
            { icon: Shield, title: 'Safe & Secure', desc: "Your privacy is protected. We don't store data." },
            { icon: Sparkles, title: 'HD Quality', desc: 'Get the best available quality.' }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border-2 border-black bg-gray-50 rounded-lg p-6">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-black mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="border-2 border-black rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6">How it works</h2>
          <div className="space-y-4">
            {[
              { title: 'Copy the URL', desc: 'Find content and copy its URL from your browser.' },
              { title: 'Paste and select format', desc: 'Paste URL and choose your format.' },
              { title: 'Download instantly', desc: 'Click download and save to your device.' }
            ].map(({ title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">{title}</h4>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}