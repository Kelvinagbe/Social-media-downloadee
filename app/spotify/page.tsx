'use client' 

import React, { useState } from 'react';
import { Download, Music, Loader2, ExternalLink, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface SpotifyData {
  thumbnail?: string;
  title: string;
  author?: string;
  duration?: string;
  downloads?: Array<{
    url: string;
    text: string;
  }>;
}

export default function SpotifyDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<SpotifyData | null>(null);

  const cleanUrl = (inputUrl: string): string => {
    return inputUrl.split('?')[0].split('#')[0].trim();
  };

  const isValidSpotifyUrl = (inputUrl: string): boolean => {
    const pattern = /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\//;
    return pattern.test(inputUrl);
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a Spotify URL');
      return;
    }

    const cleaned = cleanUrl(url);
    
    if (!isValidSpotifyUrl(cleaned)) {
      setError('Please enter a valid Spotify URL (track, album, playlist, or artist)');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(`/api/spotify?url=${encodeURIComponent(cleaned)}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to fetch Spotify content');
        return;
      }

      setData(result.data);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleDownload = (downloadUrl: string, filename?: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'spotify-audio.mp3';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-xl shadow-green-500/30">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
            Spotify Downloader
          </h1>
          <p className="text-gray-400 text-lg">
            Download your favorite tracks, albums, and playlists
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="spotify-url" className="block text-sm font-medium text-gray-300 mb-2">
                Spotify URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="spotify-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://open.spotify.com/track/..."
                  className="flex-1 px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  disabled={loading}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50 hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Fetch
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="bg-gray-700/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Tracks
              </span>
              <span className="bg-gray-700/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Albums
              </span>
              <span className="bg-gray-700/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Playlists
              </span>
              <span className="bg-gray-700/50 px-3 py-1.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Artists
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50 animate-fadeIn">
            {/* Track Info */}
            <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-700/50">
              {data.thumbnail && (
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img
                    src={data.thumbnail}
                    alt={data.title}
                    className="w-48 h-48 object-cover rounded-xl shadow-2xl"
                  />
                </div>
              )}

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <h2 className="text-3xl font-bold text-white break-words">
                  {data.title}
                </h2>

                {data.author && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-300">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{data.author}</span>
                  </div>
                )}

                {data.duration && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-300">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{data.duration}</span>
                  </div>
                )}

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm mt-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Spotify</span>
                </a>
              </div>
            </div>

            {/* Download Options */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                Download Options
              </h3>

              {data.downloads && data.downloads.length > 0 ? (
                <div className="grid gap-3">
                  {data.downloads.map((download, index) => (
                    <button
                      key={index}
                      onClick={() => handleDownload(download.url, `${data.title}.mp3`)}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 hover:from-gray-800/70 hover:to-gray-700/70 border border-gray-700 hover:border-green-500/50 rounded-xl transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                          <Music className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-white font-medium truncate">
                          {download.text}
                        </span>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors flex-shrink-0 ml-3" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No download options available
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!data && !loading && (
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 text-white">How to use:</h3>
            <ol className="space-y-3 text-gray-300">
              {[
                'Open Spotify and find the track, album, or playlist you want',
                'Click the three dots (•••) and select "Share" → "Copy link"',
                'Paste the URL above and click "Fetch"',
                'Choose your preferred quality and download'
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-lg">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}