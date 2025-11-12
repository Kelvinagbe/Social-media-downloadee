'use client' 

import React, { useState } from 'react';
import { Download, Music, Loader2, ExternalLink, Clock, User, AlertCircle } from 'lucide-react';

export default function SpotifyDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a Spotify URL');
      return;
    }

    if (!url.includes('spotify.com')) {
      setError('Please enter a valid Spotify URL');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(`/api/spotify?url=${encodeURIComponent(url)}`);
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-gray-900 to-black">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="bg-green-500 p-2.5 sm:p-3 md:p-4 rounded-full shadow-lg shadow-green-500/50">
                <Music className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent px-2">
              Spotify Downloader
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg px-4">
              Download your favorite tracks, albums, and playlists
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl border border-gray-700 mb-6 sm:mb-8">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="spotify-url" className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Spotify URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    id="spotify-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="https://open.spotify.com/track/..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500 text-sm sm:text-base"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="hidden xs:inline">Loading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        Fetch
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 text-xs text-gray-400">
                <span className="bg-gray-700/50 px-2 py-1 rounded">Tracks</span>
                <span className="bg-gray-700/50 px-2 py-1 rounded">Albums</span>
                <span className="bg-gray-700/50 px-2 py-1 rounded">Playlists</span>
                <span className="bg-gray-700/50 px-2 py-1 rounded">Artists</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-start gap-2 text-sm sm:text-base">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results */}
          {data && (
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl border border-gray-700 animate-fadeIn">
              {/* Track Info */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b border-gray-700">
                {data.thumbnail && (
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={data.thumbnail}
                      alt={data.title}
                      className="w-full sm:w-36 md:w-44 lg:w-48 h-auto aspect-square object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-2 sm:space-y-3 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words">
                    {data.title}
                  </h2>
                  
                  {data.author && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-300 text-sm sm:text-base">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{data.author}</span>
                    </div>
                  )}
                  
                  {data.duration && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-300 text-sm sm:text-base">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{data.duration}</span>
                    </div>
                  )}

                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Open in Spotify</span>
                  </a>
                </div>
              </div>

              {/* Download Options */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
                  Download Options
                </h3>
                
                {data.downloads && data.downloads.length > 0 ? (
                  <div className="grid gap-2 sm:gap-3">
                    {data.downloads.map((download, index) => (
                      <button
                        key={index}
                        onClick={() => handleDownload(download.url, `${data.title}.mp3`)}
                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-700 hover:border-green-500 rounded-lg transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="bg-green-500/10 p-1.5 sm:p-2 rounded-lg group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                          </div>
                          <span className="text-white font-medium text-sm sm:text-base truncate">
                            {download.text}
                          </span>
                        </div>
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-400 transition-colors flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-400 text-sm sm:text-base">
                    No download options available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!data && !loading && (
            <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-white">How to use:</h3>
              <ol className="space-y-2.5 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">1</span>
                  <span className="pt-0.5">Open Spotify and find the track, album, or playlist you want</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">2</span>
                  <span className="pt-0.5">Click the three dots (•••) and select "Share" → "Copy link"</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">3</span>
                  <span className="pt-0.5">Paste the URL above and click "Fetch"</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="bg-green-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">4</span>
                  <span className="pt-0.5">Choose your preferred quality and download</span>
                </li>
              </ol>
            </div>
          )}
        </div>
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
          animation: fadeIn 0.5s ease-out;
        }

        @media (min-width: 475px) {
          .xs\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}