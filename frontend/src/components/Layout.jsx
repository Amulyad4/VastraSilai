import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, activePage, onNavigate }) {
  return (
    <div className="min-h-screen flex bg-gray-950 font-sans">
      
      {/* Sidebar - fixed */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      
      {/* Content wrapper */}
      <div className="flex-grow flex flex-col pl-64 min-h-screen">
        {/* Navbar */}
        <Navbar />
        
        {/* Main page viewport */}
        <main className="flex-grow p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
