'use client' 

import React, { useState } from 'react';
import { Download, Video, Music, Image, Menu, X, Facebook, Youtube, Twitter, Instagram, Sparkles, Zap, Shield, Loader2, Check, AlertCircle } from 'lucide-react';

export default function SocialMediaDownloader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [url, setUrl] = useState('');
  const [downloadType, setDownloadType] = useState('video');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');

  const platforms = [
    { 
      id: 'all', 
      name: 'All Platforms', 
      icon: Download,
      color: 'bg-gray-900',
      hoverColor: 'hover:bg-gray-800',
      lightBg: 'bg-gray-50',
      accentColor: 'text-gray-900',
      borderColor: 'border-gray-900'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: Facebook,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      lightBg: 'bg-blue-50',
      accentColor: 'text-blue-600',
      borderColor: 'border-blue-600'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: Music,
      color: 'bg-black',
      hoverColor: 'hover:bg-gray-900',
      lightBg: 'bg-gray-50',
      accentColor: 'text-black',
      borderColor: 'border-black'
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: Youtube,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      lightBg: 'bg-red-50',
      accentColor: 'text-red-600',
      borderColor: 'border-red-600'
    },
    { 
      id: 'twitter', 
      name: 'X (Twitter)', 
      icon: Twitter,
      color: 'bg-black',
      hoverColor: 'hover:bg-gray-900',
      lightBg: 'bg-gray-50',
      accentColor: 'text-black',
      borderColor: 'border-black'
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram,
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      hoverColor: 'hover:opacity-90',
      lightBg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
      accentColor: 'text-pink-600',
      borderColor: 'border-pink-600'
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const handleDownload = async () => {
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    // TikTok download
    if (selectedPlatform === 'tiktok' && trimmedUrl.includes('tiktok.com')) {
      setIsLoading(true);
      setError('');
      setVideoInfo(null);

      try {
        const API_KEY = 'gifted';
        const API_BASE = 'https://api.giftedtech.co.ke/api/download/tiktok';
        const apiUrl = `${API_BASE}?apikey=${API_KEY}&url=${encodeURIComponent(trimmedUrl)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        setIsLoading(false);

        if (data.success === false || data.status !== 200) {
          setError(data.message || 'Failed to fetch video. Please check the URL and try again.');
        } else if (data.success === true && data.result) {
          setVideoInfo(data.result);
          setError('');
        } else if (data.result === null) {
          setError('No video data found. The video might be private or unavailable.');
        } else {
          setError('Unexpected response from server. Please try again.');
        }
      } catch (err) {
        setIsLoading(false);
        setError('Network error. Please check your connection and try again.');
        console.error('Error:', err);
      }
    } else {
      // Generic download for other platforms (demo)
      setIsLoading(true);
      setError('');
      setVideoInfo(null);
      
      setTimeout(() => {
        setIsLoading(false);
        setError('API integration needed for this platform. TikTok is fully functional!');
      }, 1500);
    }
  };

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-900" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">MediaGrab</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
              <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-200 z-40 overflow-y-auto`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <span className="text-sm font-medium text-gray-900">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-md">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 px-3 mb-3">PLATFORMS</div>
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.id;
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setSidebarOpen(false);
                      setVideoInfo(null);
                      setError('');
                      setUrl('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? `${platform.color} text-white shadow-lg ${platform.hoverColor}`
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 px-3 mb-3">FORMAT</div>
              <div className="space-y-1">
                <label className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
                  <input
                    type="radio"
                    name="type"
                    value="video"
                    checked={downloadType === 'video'}
                    onChange={(e) => setDownloadType(e.target.value)}
                    className="w-4 h-4 text-gray-900"
                  />
                  <Video className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Video</span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
                  <input
                    type="radio"
                    name="type"
                    value="audio"
                    checked={downloadType === 'audio'}
                    onChange={(e) => setDownloadType(e.target.value)}
                    className="w-4 h-4 text-gray-900"
                  />
                  <Music className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Audio</span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
                  <input
                    type="radio"
                    name="type"
                    value="image"
                    checked={downloadType === 'image'}
                    onChange={(e) => setDownloadType(e.target.value)}
                    className="w-4 h-4 text-gray-900"
                  />
                  <Image className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Image</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
          <div className="max-w-4xl mx-auto">
            
            {/* Hero Section */}
            <div className="mb-12">
              <div className={`inline-flex items-center gap-2 px-3 py-1 ${currentPlatform?.lightBg} rounded-full mb-4`}>
                <Sparkles className={`w-3 h-3 ${currentPlatform?.accentColor}`} />
                <span className={`text-xs font-medium ${currentPlatform?.accentColor}`}>Fast & Reliable</span>
              </div>
              <h1 className={`text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${currentPlatform?.accentColor}`}>
                Download from {currentPlatform?.name || 'Any Platform'}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Save videos, audio, and images from your favorite social platforms. Fast, free, and easy to use.
              </p>
            </div>

            {/* Download Card */}
            <div className={`bg-white border-2 ${currentPlatform?.borderColor} rounded-xl p-8 mb-8 shadow-sm`}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Enter URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                    placeholder={`https://www.${selectedPlatform === 'all' ? 'tiktok' : selectedPlatform}.com/...`}
                    className={`w-full px-4 py-3 bg-white border-2 ${currentPlatform?.borderColor} rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all text-sm`}
                  />
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isLoading}
                  className={`w-full ${currentPlatform?.color} text-white font-medium py-3 px-6 rounded-lg ${currentPlatform?.hoverColor} transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download {downloadType}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
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
                    <h3 className="text-lg font-semibold text-gray-900">Video Found!</h3>
                  </div>

                  {/* Thumbnail */}
                  {(videoInfo.thumbnail || videoInfo.cover) && (
                    <img 
                      src={videoInfo.thumbnail || videoInfo.cover} 
                      alt="Video Thumbnail" 
                      className="w-full rounded-lg mb-4 border-2 border-gray-200"
                    />
                  )}

                  {/* Video Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                    {(videoInfo.title || videoInfo.description) && (
                      <p><strong className="text-gray-900">Description:</strong> <span className="text-gray-600">{videoInfo.title || videoInfo.description}</span></p>
                    )}
                    {(videoInfo.author || videoInfo.username) && (
                      <p><strong className="text-gray-900">Author:</strong> <span className="text-gray-600">@{videoInfo.author || videoInfo.username}</span></p>
                    )}
                    {videoInfo.duration && (
                      <p><strong className="text-gray-900">Duration:</strong> <span className="text-gray-600">{videoInfo.duration}s</span></p>
                    )}
                    {videoInfo.likes && (
                      <p><strong className="text-gray-900">Likes:</strong> <span className="text-gray-600">{formatNumber(videoInfo.likes)}</span></p>
                    )}
                    {videoInfo.views && (
                      <p><strong className="text-gray-900">Views:</strong> <span className="text-gray-600">{formatNumber(videoInfo.views)}</span></p>
                    )}
                    {videoInfo.shares && (
                      <p><strong className="text-gray-900">Shares:</strong> <span className="text-gray-600">{formatNumber(videoInfo.shares)}</span></p>
                    )}
                  </div>

                  {/* Download Links */}
                  <div className="space-y-2">
                    {(videoInfo.video || videoInfo.videoUrl || videoInfo.download) && (
                      <a 
                        href={videoInfo.video || videoInfo.videoUrl || videoInfo.download}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block w-full ${currentPlatform?.color} text-white text-center font-medium py-3 px-6 rounded-lg ${currentPlatform?.hoverColor} transition-all`}
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
                        className={`block w-full ${currentPlatform?.color} text-white text-center font-medium py-3 px-6 rounded-lg ${currentPlatform?.hoverColor} transition-all`}
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
                        className={`block w-full ${currentPlatform?.color} text-white text-center font-medium py-3 px-6 rounded-lg ${currentPlatform?.hoverColor} transition-all`}
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
                        className="block w-full bg-gray-900 text-white text-center font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-all"
                      >
                        🎵 Download Audio Only
                      </a>
                    )}
                    
                    {videoInfo.images && Array.isArray(videoInfo.images) && videoInfo.images.length > 0 && 
                      videoInfo.images.map((img, index) => (
                        <a 
                          key={index}
                          href={img}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block w-full ${currentPlatform?.color} text-white text-center font-medium py-3 px-6 rounded-lg ${currentPlatform?.hoverColor} transition-all`}
                        >
                          🖼️ Download Image {index + 1}
                        </a>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className={`border-2 ${currentPlatform?.borderColor} ${currentPlatform?.lightBg} rounded-lg p-6`}>
                <div className={`w-10 h-10 ${currentPlatform?.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-sm font-semibold ${currentPlatform?.accentColor} mb-2`}>Lightning Fast</h3>
                <p className="text-sm text-gray-600">Download your content in seconds with our optimized servers.</p>
              </div>
              
              <div className={`border-2 ${currentPlatform?.borderColor} ${currentPlatform?.lightBg} rounded-lg p-6`}>
                <div className={`w-10 h-10 ${currentPlatform?.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-sm font-semibold ${currentPlatform?.accentColor} mb-2`}>Safe & Secure</h3>
                <p className="text-sm text-gray-600">Your privacy is protected. We don't store any of your data.</p>
              </div>
              
              <div className={`border-2 ${currentPlatform?.borderColor} ${currentPlatform?.lightBg} rounded-lg p-6`}>
                <div className={`w-10 h-10 ${currentPlatform?.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className={`text-sm font-semibold ${currentPlatform?.accentColor} mb-2`}>HD Quality</h3>
                <p className="text-sm text-gray-600">Get the best available quality for all your downloads.</p>
              </div>
            </div>

            {/* How it Works */}
            <div className={`border-2 ${currentPlatform?.borderColor} rounded-lg p-8`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">How it works</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 ${currentPlatform?.color} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Copy the URL</h4>
                    <p className="text-sm text-gray-600">Find the content you want and copy its URL from your browser.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 ${currentPlatform?.color} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Paste and select format</h4>
                    <p className="text-sm text-gray-600">Paste the URL above and choose your preferred download format.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 ${currentPlatform?.color} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Download instantly</h4>
                    <p className="text-sm text-gray-600">Click download and save your content to your device.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}