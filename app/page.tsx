'use client' 

import React from 'react';
import { Sparkles, Zap, Shield, Download, Play, Film, Music, Image as ImageIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-slate-950 text-white px-6 py-8 lg:px-12 lg:py-12">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Fast & Reliable</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Download from All Platforms
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Save videos, audio, and images from your favorite social platforms. Fast, free, and easy to use.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { name: 'TikTok', color: 'from-black to-gray-900', href: '/tiktok', desc: 'Download TikTok videos without watermark', icon: Music },
            { name: 'YouTube', color: 'from-red-600 to-red-700', href: '/youtube', desc: 'Save YouTube videos and audio', icon: Play },
            { name: 'Facebook', color: 'from-blue-600 to-blue-700', href: '/facebook', desc: 'Download Facebook videos and reels', icon: Film },
            { name: 'Instagram', color: 'from-purple-600 via-pink-600 to-orange-500', href: '/instagram', desc: 'Save Instagram posts, reels, and stories', icon: ImageIcon },
            { name: 'X (Twitter)', color: 'from-gray-900 to-black', href: '/twitter', desc: 'Download Twitter videos and GIFs', icon: Film },
          ].map(platform => {
            const Icon = platform.icon;
            return (
              <a 
                key={platform.name}
                href={platform.href}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-purple-500/10 transform hover:scale-[1.02]"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${platform.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-slate-400">{platform.desc}</p>
              </a>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Download in seconds with optimized servers.', gradient: 'from-yellow-500 to-orange-500' },
            { icon: Shield, title: 'Safe & Secure', desc: "Your privacy is protected. We don't store data.", gradient: 'from-green-500 to-emerald-500' },
            { icon: Sparkles, title: 'HD Quality', desc: 'Get the best available quality.', gradient: 'from-purple-500 to-pink-500' }
          ].map(({ icon: Icon, title, desc, gradient }) => (
            <div key={title} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all">
              <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              ℹ️
            </div>
            How it works
          </h2>
          <div className="space-y-6">
            {[
              { title: 'Select Platform', desc: 'Choose your platform from the sidebar or click a card above.', gradient: 'from-blue-500 to-cyan-500' },
              { title: 'Paste URL', desc: 'Copy and paste the content URL from your browser.', gradient: 'from-purple-500 to-pink-500' },
              { title: 'Download', desc: 'Click download and save to your device instantly.', gradient: 'from-green-500 to-emerald-500' }
            ].map(({ title, desc, gradient }, i) => (
              <div key={i} className="flex gap-4">
                <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${gradient} text-white rounded-full flex items-center justify-center text-base font-bold shadow-lg`}>
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h4 className="text-base font-semibold mb-1 text-white">{title}</h4>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
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

        {/* Footer */}
        <div className="text-center mt-12 text-xs text-slate-500">
          <p>Powered by UniversalDownloader 🚀</p>
          <p className="mt-1">For personal use only • Respect content creators & copyright</p>
        </div>

      </div>
    </main>
  );
}