'use client' 

import React, { useState } from 'react';
import { Download, AlertCircle, Loader2, CheckCircle, Video, Image } from 'lucide-react';

export default function TwitterDownloader() {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mediaData, setMediaData] = useState<Array<{quality: string, type: string, url: string}> | null>(null);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a Twitter/X URL');
      return;
    }

    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      setError('Please enter a valid Twitter/X URL');
      return;
    }

    setLoading(true);
    setError('');
    setMediaData(null);

    try {
      const response = await fetch(`/api/twitter/download?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        setMediaData(data.data);
      } else {
        setError(data.message || 'Failed to fetch media. The tweet might be private or contain no media.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = (downloadUrl: string, quality: string) => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `twitter-media-${quality}-${Date.now()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMediaIcon = (type: string) => {
    if (type.toLowerCase().includes('video') || type.toLowerCase().includes('mp4')) {
      return <Video className="w-5 h-5" />;
    }
    return <Image className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-black p-6 rounded-2xl shadow-lg w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-14 h-14 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            X Media Downloader
          </h1>
          <p className="text-gray-600 text-lg">
            Download videos and images from X (Twitter) posts in high quality
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Tweet URL
              </label>
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://twitter.com/username/status/123456789..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                disabled={loading}
                onKeyDown={(e) => e.key === 'Enter' && handleDownload(e as any)}
              />
            </div>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Fetching Media...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Get Download Links
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message with Media */}
          {mediaData && mediaData.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800">Success!</h3>
                  <p className="text-green-700 text-sm">Found {mediaData.length} media file(s)</p>
                </div>
              </div>

              {/* Media Cards */}
              <div className="grid gap-3">
                {mediaData.map((media, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        {getMediaIcon(media.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {media.quality}
                        </h3>
                        <p className="text-sm text-gray-600">{media.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDirectDownload(media.url, media.quality)}
                      className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to use:</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Copy the URL of any X (Twitter) post containing media</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Paste the URL into the input field above</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Click "Get Download Links" to fetch available media</span>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Choose your preferred quality and click "Download"</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Download media from public X (Twitter) posts for personal use only.</p>
          <p className="mt-1">Please respect content creators' rights and X's terms of service.</p>
        </div>
      </div>
    </div>
  );
}