'use client' 

import React from 'react';
import { Sparkles, Zap, Shield, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full mb-4">
            <Sparkles className="w-3 h-3 text-gray-900" />
            <span className="text-xs font-medium text-gray-900">Fast & Reliable</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-gray-900">
            Download from All Platforms
          </h1>
          <p className="text-lg text-gray-600">
            Save videos, audio, and images from your favorite social platforms. Fast, free, and easy to use.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { name: 'TikTok', color: 'bg-black', href: '/tiktok', desc: 'Download TikTok videos without watermark' },
            { name: 'YouTube', color: 'bg-red-600', href: '/youtube', desc: 'Save YouTube videos and audio' },
            { name: 'Facebook', color: 'bg-blue-600', href: '/facebook', desc: 'Download Facebook videos and reels' },
            { name: 'Instagram', color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500', href: '/instagram', desc: 'Save Instagram posts, reels, and stories' },
            { name: 'X (Twitter)', color: 'bg-black', href: '/twitter', desc: 'Download Twitter videos and GIFs' },
          ].map(platform => (
            <a 
              key={platform.name}
              href={platform.href}
              className="border-2 border-gray-200 hover:border-gray-900 rounded-xl p-6 transition-all group"
            >
              <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{platform.name}</h3>
              <p className="text-sm text-gray-600">{platform.desc}</p>
            </a>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Download in seconds with optimized servers.' },
            { icon: Shield, title: 'Safe & Secure', desc: "Your privacy is protected. We don't store data." },
            { icon: Sparkles, title: 'HD Quality', desc: 'Get the best available quality.' }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border-2 border-gray-200 bg-gray-50 rounded-lg p-6">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="border-2 border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-6">How it works</h2>
          <div className="space-y-4">
            {[
              { title: 'Select Platform', desc: 'Choose your platform from the sidebar or click a card above.' },
              { title: 'Paste URL', desc: 'Copy and paste the content URL from your browser.' },
              { title: 'Download', desc: 'Click download and save to your device instantly.' }
            ].map(({ title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
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