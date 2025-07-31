import React, { useState } from 'react';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEdit, 
  FaVideo, 
  FaTrash, 
  FaStar 
} from 'react-icons/fa';
import CreateCourseForm from './CreateCourseForm';

interface Course {
  id: number;
  title: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  status: string;
  progress: number;
  category: string;
  duration: string;
  lessons: number;
}

interface CoursesProps {
  courses: Course[];
}

const Courses: React.FC<CoursesProps> = ({ courses }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);

  // Function to generate modern text-based thumbnail
  const generateTextThumbnail = (title: string) => {
    // Generate gradient colors based on title
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
    
    const gradientIndex = title.length % gradients.length;
    const gradient = gradients[gradientIndex];
    
    // Create SVG with modern design
    const svg = `
      <svg width="400" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.1"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="240" fill="url(#gradient)" rx="12"/>
        
        <!-- Decorative elements -->
        <circle cx="320" cy="60" r="40" fill="rgba(255,255,255,0.1)"/>
        <circle cx="80" cy="180" r="30" fill="rgba(255,255,255,0.1)"/>
        <circle cx="350" cy="200" r="20" fill="rgba(255,255,255,0.1)"/>
        
        <!-- Main text -->
        <text x="200" y="140" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="700" 
              text-anchor="middle" fill="white" filter="url(#shadow)">
          ${title}
        </text>
        
        <!-- Subtitle -->
        <text x="200" y="170" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="500" 
              text-anchor="middle" fill="rgba(255,255,255,0.8)">
          Course
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(svgBlob);
  };

  const handleCreateCourse = async (courseData: any) => {
    const category = courseData.program.charAt(0).toUpperCase() + courseData.program.slice(1);
    
    // Create a new course object with the form data
    const newCourse: Course = {
      id: Date.now(), // Simple ID generation
      title: courseData.title,
      thumbnail: courseData.thumbnail ? URL.createObjectURL(courseData.thumbnail) : generateTextThumbnail(courseData.title),
      students: 0,
      rating: 0,
      price: courseData.credits,
      status: 'active',
      progress: 0,
      category: category,
      duration: '12 weeks',
      lessons: 24
    };

    // Add the new course to the local state
    setLocalCourses(prev => [newCourse, ...prev]);
    setShowCreateForm(false);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <p className="text-gray-600 mt-1">Manage and track your course performance</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <FaPlus className="text-sm" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Filter by category"
            >
              <option>All Categories</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Filter courses"
            >
              <FaFilter />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Sort courses"
            >
              <FaSort />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status}
                </span>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  ${course.price}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <FaStar className="text-sm" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{course.students} students</span>
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{course.duration}</span>
                  <span>{course.category}</span>
                </div>
              </div>

              {course.status === 'active' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button 
                  className="flex-1 flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-600 py-2 px-3 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                  title="Edit course"
                >
                  <FaEdit className="text-sm" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button 
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors duration-200"
                  title="Add video to course"
                >
                  <FaVideo className="text-sm" />
                  <span className="text-sm font-medium">Add Video</span>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete course"
                >
                  <FaTrash className="text-sm" />
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

export default Courses; 