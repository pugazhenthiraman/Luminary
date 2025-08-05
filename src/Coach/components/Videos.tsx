import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaVideo, 
  FaPlay, 
  FaEdit, 
  FaShare, 
  FaTrash,
  FaTimes
} from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../components/Toast';
import CreateCourseForm from './CreateCourseForm';

const Videos: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [videos, setVideos] = useState([
    { id: 1, title: 'Lesson 1: Introduction to Calculus', course: 'Advanced Calculus Course', views: '2.3K', duration: '12:34' },
    { id: 2, title: 'Lesson 2: Derivatives and Limits', course: 'Advanced Calculus Course', views: '1.8K', duration: '15:22' },
    { id: 3, title: 'Lesson 3: Integration Techniques', course: 'Advanced Calculus Course', views: '1.5K', duration: '18:45' },
    { id: 4, title: 'Lesson 4: Applications of Calculus', course: 'Advanced Calculus Course', views: '1.2K', duration: '20:10' },
    { id: 5, title: 'Lesson 5: Series and Sequences', course: 'Advanced Calculus Course', views: '980', duration: '16:30' },
    { id: 6, title: 'Lesson 6: Multivariable Calculus', course: 'Advanced Calculus Course', views: '750', duration: '22:15' }
  ]);

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

  const handleDeleteVideo = (videoId: number) => {
    if (window.confirm(`Are you sure you want to delete this video? This action cannot be undone.`)) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
      showSuccessToast('Video deleted successfully');
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    // Create new course data
    const newCourse = {
      id: Date.now(), // Use timestamp as unique ID
      title: courseData.title || `New Course ${videos.length + 1}`,
      thumbnail: courseData.thumbnail || '',
      students: 0,
      rating: 0,
      price: courseData.credits || 0,
      status: 'active',
      category: courseData.category || 'New Course',
      duration: courseData.duration || '00:00',
      lessons: 1,
      weeklySchedule: courseData.weeklySchedule || [],
      videoThumbnail: courseData.videoThumbnail || '',
      hasVideo: true
    };

    // Save to localStorage for shared state
    const existingCourses = JSON.parse(localStorage.getItem('sharedCourses') || '[]');
    const updatedCourses = [...existingCourses, newCourse];
    localStorage.setItem('sharedCourses', JSON.stringify(updatedCourses));

    // Update local videos state
    const newVideo = {
      id: newCourse.id,
      title: newCourse.title,
      course: newCourse.category,
      views: '0',
      duration: newCourse.duration
    };
    setVideos(prev => [...prev, newVideo]);
    setShowCreateForm(false);
    showSuccessToast('Course with video created successfully');
  };

  // Load shared courses from localStorage on component mount
  useEffect(() => {
    const sharedCourses = JSON.parse(localStorage.getItem('sharedCourses') || '[]');
    if (sharedCourses.length > 0) {
      // Convert shared courses to video format
      const sharedVideos = sharedCourses.map((course: any) => ({
        id: course.id,
        title: course.title,
        course: course.category,
        views: '0',
        duration: course.duration || '00:00'
      }));
      
      setVideos(prev => {
        // Merge shared videos with existing videos, avoiding duplicates
        const existingIds = new Set(prev.map(video => video.id));
        const newSharedVideos = sharedVideos.filter((video: any) => !existingIds.has(video.id));
        return [...newSharedVideos, ...prev];
      });
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Video Library</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Upload and manage your course videos</p>
        </div>
      </div>

      {/* Video Upload Area */}
      <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-200">
        <div 
          onClick={() => setShowCreateForm(true)}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 lg:p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FaVideo className="text-lg sm:text-2xl text-indigo-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Create Course with Video</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Upload video and create a new course with all details</p>
          <button className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base font-medium">
            Create Course
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative">
              <img
                src={generateVideoThumbnail(video.id)}
                alt={`Video ${video.id}`}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <button 
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                  title="Play video"
                >
                  <FaPlay className="text-gray-800 text-xs sm:text-sm lg:text-base" />
                </button>
              </div>
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                <span className="bg-black/70 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">{video.duration}</span>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 lg:p-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base lg:text-lg line-clamp-2">{video.title}</h3>
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-3">
                <span className="truncate flex-1 mr-2">{video.course}</span>
                <span className="flex-shrink-0">{video.views} views</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 py-2 px-2 sm:px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="Edit video"
                >
                  <FaEdit className="text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Edit</span>
                </button>
                <button 
                  className="flex-1 flex items-center justify-center space-x-1 bg-gray-50 text-gray-600 py-2 px-2 sm:px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  title="Share video"
                >
                  <FaShare className="text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
                </button>
                <button 
                  onClick={() => handleDeleteVideo(video.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete video"
                >
                  <FaTrash className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Course Form Modal */}
      {showCreateForm && (
        <CreateCourseForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCourse}
        />
      )}
    </div>
  );
};

export default Videos; 