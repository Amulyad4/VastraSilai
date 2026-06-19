import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, activePage, onNavigate }) {
  return (
    <div className="min-h-screen flex bg-gray-950 font-sans bg-stitch-grid relative overflow-hidden">
      
      {/* Background glow spots */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full glow-spot-purple -z-10 animate-blob-1 pointer-events-none"></div>
      <div className="absolute -bottom-60 -right-60 w-[900px] h-[900px] rounded-full glow-spot-blue -z-10 animate-blob-2 pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full glow-spot-pink -z-10 animate-blob-3 pointer-events-none"></div>

      {/* Decorative full-screen sewing stitch lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 html.light:opacity-20" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M -100,200 C 200,100 400,400 800,250 S 1200,600 1800,300" 
          fill="none" 
          stroke="rgba(168, 85, 247, 0.12)" 
          strokeWidth="2.5" 
          strokeDasharray="6,6" 
          className="animate-stitch-flow" 
        />
        <path 
          d="M 100,900 C 400,1000 600,700 1000,900 S 1400,600 1900,800" 
          fill="none" 
          stroke="rgba(236, 72, 153, 0.1)" 
          strokeWidth="2" 
          strokeDasharray="4,6" 
          className="animate-stitch-flow" 
          style={{ animationDirection: 'reverse', animationDuration: '15s' }}
        />
      </svg>

      {/* Sidebar - fixed */}
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      
      {/* Content wrapper */}
      <div className="flex-grow flex flex-col pl-64 min-h-screen relative z-10">
        {/* Navbar */}
        <Navbar />
        
        {/* Main page viewport */}
        <main className="flex-grow p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
