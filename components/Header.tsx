'use client';

import React from 'react';
import { Download, Menu } from 'lucide-react';

export default function Header() {
  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar?.classList.toggle('-translate-x-full');
    overlay?.classList.toggle('hidden');
  };

  return (
    <header className="border-b border-gray-800 sticky top-0 z-50 bg-black backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-black" />
              </div>
              <span className="text-lg font-semibold text-white">Media Grab</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
              Docs
            </a>
            <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}