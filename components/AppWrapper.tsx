import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}