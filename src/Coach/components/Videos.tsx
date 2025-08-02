import React, { useState } from 'react';
import { 
  FaPlus, 
  FaVideo, 
  FaPlay, 
  FaEdit, 
  FaShare, 
  FaTrash 
} from 'react-icons/fa';

const Videos: React.FC = () => {
  // Function to generate modern text-based thumbnail
  const generateVideoThumbnail = (videoNumber: number) => {
    // Generate gradient colors based on video number
    const gradients = [
      { from: '#6366f1', to: '#8b5cf6' }, // Indigo to Purple
      { from: '#3b82f6', to: '#06b6d4' }, // Blue to Cyan
      { from: '#10b981', to: '#059669' }, // Green to Emerald
      { from: '#f97316', to: '#dc2626' }, // Orange to Red
      { from: '#ec4899', to: '#e11d48' }, // Pink to Rose
      { from: '#eab308', to: '#ea580c' }, // Yellow to Orange
      { from: '#14b8a6', to: '#2563eb' }, // Teal to Blue
      { from: '#8b5cf6', to: '#7c3aed' }  // Violet to Purple
    ];
    
    const gradientIndex = videoNumber % gradients.length;
    const gradient = gradients[gradientIndex];
    
    // Create SVG with modern design
    const svg = `
      <svg width="400" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient${videoNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow${videoNumber}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="240" fill="url(#gradient${videoNumber})" rx="12"/>
        
        <!-- Decorative elements -->
        <circle cx="320" cy="60" r="40" fill="rgba(255,255,255,0.1)"/>
        <circle cx="80" cy="180" r="30" fill="rgba(255,255,255,0.1)"/>
        <circle cx="350" cy="200" r="20" fill="rgba(255,255,255,0.1)"/>
        
        <!-- Video icon -->
        <circle cx="200" cy="120" r="40" fill="rgba(255,255,255,0.2)"/>
        <polygon points="185,110 185,130 205,120" fill="white"/>
        
        <!-- Main text -->
        <text x="200" y="180" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="600" 
              text-anchor="middle" fill="white" filter="url(#shadow${videoNumber})">
          Video ${videoNumber}
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(svgBlob);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Video Library</h2>
          <p className="text-gray-600 mt-1">Upload and manage your course videos</p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
          <FaPlus className="text-sm" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Video Upload Area */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 cursor-pointer">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaVideo className="text-2xl text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload New Video</h3>
          <p className="text-gray-600 mb-4">Drag and drop your video files here, or click to browse</p>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Choose Files
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((video) => (
          <div key={video} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative">
              <img
                src={generateVideoThumbnail(video)}
                alt={`Video ${video}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <button 
                  className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                  title="Play video"
                >
                  <FaPlay className="text-gray-800" />
                </button>
              </div>
              <div className="absolute top-3 right-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">12:34</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Lesson {video}: Introduction to Calculus</h3>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Advanced Calculus Course</span>
                <span>2.3K views</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="Edit video"
                >
                  <FaEdit className="text-sm" />
                  <span className="text-sm">Edit</span>
                </button>
                <button 
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="Share video"
                >
                  <FaShare className="text-sm" />
                  <span className="text-sm">Share</span>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete video"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Videos; 