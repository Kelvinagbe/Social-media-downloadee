'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Facebook, Youtube, Twitter, Instagram, Video, Music, Image as ImageIcon, X } from 'lucide-react';

const platforms = [
  { id: 'all', name: 'All Platforms', icon: Download, href: '/', color: 'bg-gray-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, href: '/facebook', color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', icon: Music, href: '/tiktok', color: 'bg-gray-900' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, href: '/youtube', color: 'bg-red-600' },
  { id: 'spotify', name: 'Spotify', icon: Music, href: '/spotify', color: 'bg-green-600' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const closeSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  };

  return (
    <>
      <aside 
        id="sidebar"
        className="-translate-x-full lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gray-950 border-r border-gray-800 transition-transform z-40 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="text-sm font-medium text-white">Menu</span>
            <button onClick={closeSidebar} className="p-1 hover:bg-gray-800 rounded-md text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500 px-3 mb-3">PLATFORMS</div>
            {platforms.map(p => {
              const Icon = p.icon;
              const active = pathname === p.href;
              return (
                <Link 
                  key={p.id} 
                  href={p.href}
                  onClick={closeSidebar}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active 
                      ? `${p.color} text-white shadow-lg` 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{p.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-xs font-medium text-gray-500 px-3 mb-3">FORMAT</div>
            <div className="space-y-1">
              {[
                { val: 'video', icon: Video, label: 'Video' }, 
                { val: 'audio', icon: Music, label: 'Audio' }, 
                { val: 'image', icon: ImageIcon, label: 'Image' }
              ].map(({ val, icon: Icon, label }) => (
                <label key={val} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-800 group transition-colors">
                  <input 
                    type="radio" 
                    name="type" 
                    value={val} 
                    defaultChecked={val === 'video'} 
                    className="w-4 h-4 accent-white" 
                  />
                  <Icon className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div 
        id="overlay"
        className="hidden fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" 
        onClick={closeSidebar}
      />
    </>
  );
}