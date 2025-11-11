'use client' 

import React, { useState } from 'react';
import { Download, Video, Music, Image, Menu, X, Facebook, Youtube, Twitter, Instagram, Sparkles, Zap, Shield, Loader2, Check, AlertCircle } from 'lucide-react';

export default function SocialMediaDownloader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [url, setUrl] = useState('');
  const [downloadType, setDownloadType] = useState('video');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState('');

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: Download, color: 'bg-gray-900', hover: 'hover:bg-gray-800', bg: 'bg-gray-50', text: 'text-gray-900', border: 'border-gray-900' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600', hover: 'hover:bg-blue-700', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'bg-black', hover: 'hover:bg-gray-900', bg: 'bg-gray-50', text: 'text-black', border: 'border-black' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600', hover: 'hover:bg-red-700', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-600' },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'bg-black', hover: 'hover:bg-gray-900', bg: 'bg-gray-50', text: 'text-black', border: 'border-black' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500', hover: 'hover:opacity-90', bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50', text: 'text-pink-600', border: 'border-pink-600' },
  ];

  const current = platforms.find(p => p.id === selectedPlatform) || platforms[0];

  const formatNum = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : n.toString();

  const handleDownload = async () => {
    const trimmed = url.trim();
    if (!trimmed) return setError('Please enter a valid URL');

    if (selectedPlatform === 'tiktok' && trimmed.includes('tiktok.com')) {
      setIsLoading(true);
      setError('');
      setVideoInfo(null);

      try {
        const res = await fetch(`https://api.giftedtech.co.ke/api/download/tiktok?apikey=gifted&url=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setIsLoading(false);

        if (!data.success || data.status !== 200) setError(data.message || 'Failed to fetch video');
        else if (data.result) setVideoInfo(data.result);
        else setError('No video found. May be private or unavailable.');
      } catch {
        setIsLoading(false);
        setError('Network error. Check connection and retry.');
      }
    } else {
      setIsLoading(true);
      setError('');
      setVideoInfo(null);
      setTimeout(() => {
        setIsLoading(false);
        setError('API needed for this platform. TikTok works!');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold">MediaGrab</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Docs</a>
              <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800">Get Started</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r transition-transform z-40 overflow-y-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <span className="text-sm font-medium">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 px-3 mb-3">PLATFORMS</div>
              {platforms.map(p => {
                const Icon = p.icon;
                const active = selectedPlatform === p.id;
                return (
                  <button key={p.id} onClick={() => { setSelectedPlatform(p.id); setSidebarOpen(false); setVideoInfo(null); setError(''); setUrl(''); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? `${p.color} text-white shadow-lg ${p.hover}` : 'text-gray-600 hover:bg-gray-50'}`}>
                    <Icon className="w-4 h-4" />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="text-xs font-medium text-gray-500 px-3 mb-3">FORMAT</div>
              <div className="space-y-1">
                {[{ val: 'video', icon: Video, label: 'Video' }, { val: 'audio', icon: Music, label: 'Audio' }, { val: 'image', icon: Image, label: 'Image' }].map(({ val, icon: Icon, label }) => (
                  <label key={val} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 group">
                    <input type="radio" name="type" value={val} checked={downloadType === val} onChange={(e) => setDownloadType(e.target.value)} className="w-4 h-4" />
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Hero */}
            <div className="mb-12">
              <div className={`inline-flex items-center gap-2 px-3 py-1 ${current.bg} rounded-full mb-4`}>
                <Sparkles className={`w-3 h-3 ${current.text}`} />
                <span className={`text-xs font-medium ${current.text}`}>Fast & Reliable</span>
              </div>
              <h1 className={`text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${current.text}`}>Download from {current.name}</h1>
              <p className="text-lg text-gray-600">Save videos, audio, and images from your favorite social platforms. Fast, free, and easy to use.</p>
            </div>

            {/* Download Card */}
            <div className={`bg-white border-2 ${current.border} rounded-xl p-8 mb-8 shadow-sm`}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter URL</label>
                  <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                    placeholder={`https://www.${selectedPlatform === 'all' ? 'tiktok' : selectedPlatform}.com/...`}
                    className={`w-full px-4 py-3 bg-white border-2 ${current.border} rounded-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-20 text-sm`} />
                </div>

                <button onClick={handleDownload} disabled={isLoading}
                  className={`w-full ${current.color} text-white font-medium py-3 px-6 rounded-lg ${current.hover} transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg`}>
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing...</span></> : <><Download className="w-4 h-4" /><span>Download {downloadType}</span></>}
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

                  {(videoInfo.thumbnail || videoInfo.cover) && <img src={videoInfo.thumbnail || videoInfo.cover} alt="Thumbnail" className="w-full rounded-lg mb-4 border-2 border-gray-200" />}

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                    {(videoInfo.title || videoInfo.description) && <p><strong>Description:</strong> {videoInfo.title || videoInfo.description}</p>}
                    {(videoInfo.author || videoInfo.username) && <p><strong>Author:</strong> @{videoInfo.author || videoInfo.username}</p>}
                    {videoInfo.duration && <p><strong>Duration:</strong> {videoInfo.duration}s</p>}
                    {videoInfo.likes && <p><strong>Likes:</strong> {formatNum(videoInfo.likes)}</p>}
                    {videoInfo.views && <p><strong>Views:</strong> {formatNum(videoInfo.views)}</p>}
                    {videoInfo.shares && <p><strong>Shares:</strong> {formatNum(videoInfo.shares)}</p>}
                  </div>

                  <div className="space-y-2">
                    {(videoInfo.video || videoInfo.videoUrl || videoInfo.download) && 
                      <a href={videoInfo.video || videoInfo.videoUrl || videoInfo.download} download target="_blank" rel="noopener noreferrer"
                        className={`block w-full ${current.color} text-white text-center font-medium py-3 px-6 rounded-lg ${current.hover}`}>
                        📥 Download Video (With Watermark)
                      </a>
                    }
                    {(videoInfo.videoHD || videoInfo.hdVideo) && 
                      <a href={videoInfo.videoHD || videoInfo.hdVideo} download target="_blank" rel="noopener noreferrer"
                        className={`block w-full ${current.color} text-white text-center font-medium py-3 px-6 rounded-lg ${current.hover}`}>
                        📥 Download HD Video
                      </a>
                    }
                    {videoInfo.videoWatermark === false && videoInfo.videoNoWatermark && 
                      <a href={videoInfo.videoNoWatermark} download target="_blank" rel="noopener noreferrer"
                        className={`block w-full ${current.color} text-white text-center font-medium py-3 px-6 rounded-lg ${current.hover}`}>
                        📥 Download Video (No Watermark)
                      </a>
                    }
                    {(videoInfo.audio || videoInfo.music || videoInfo.audioUrl) && 
                      <a href={videoInfo.audio || videoInfo.music || videoInfo.audioUrl} download target="_blank" rel="noopener noreferrer"
                        className="block w-full bg-gray-900 text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-gray-800">
                        🎵 Download Audio Only
                      </a>
                    }
                    {videoInfo.images?.map((img: string, i: number) => (
                      <a key={i} href={img} download target="_blank" rel="noopener noreferrer"
                        className={`block w-full ${current.color} text-white text-center font-medium py-3 px-6 rounded-lg ${current.hover}`}>
                        🖼️ Download Image {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[{ icon: Zap, title: 'Lightning Fast', desc: 'Download in seconds with optimized servers.' },
                { icon: Shield, title: 'Safe & Secure', desc: "Your privacy is protected. We don't store data." },
                { icon: Sparkles, title: 'HD Quality', desc: 'Get the best available quality.' }].map(({ icon: Icon, title, desc }) => (
                <div key={title} className={`border-2 ${current.border} ${current.bg} rounded-lg p-6`}>
                  <div className={`w-10 h-10 ${current.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className={`text-sm font-semibold ${current.text} mb-2`}>{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>

            {/* How it Works */}
            <div className={`border-2 ${current.border} rounded-lg p-8`}>
              <h2 className="text-xl font-semibold mb-6">How it works</h2>
              <div className="space-y-4">
                {[{ title: 'Copy the URL', desc: 'Find content and copy its URL from your browser.' },
                  { title: 'Paste and select format', desc: 'Paste URL and choose your format.' },
                  { title: 'Download instantly', desc: 'Click download and save to your device.' }].map(({ title, desc }, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${current.color} text-white rounded-full flex items-center justify-center text-sm font-medium`}>{i + 1}</div>
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
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}