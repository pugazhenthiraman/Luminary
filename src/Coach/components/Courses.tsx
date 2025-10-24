import React, { useState, useMemo, useEffect } from 'react';
import CoachCourseDetailsModal from './CoachCourseDetailsModal';
import { 
  FaPlus, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaVideo, 
  FaStar,
  FaTimes,
  FaTrash
} from 'react-icons/fa';
import CreateCourseForm from './CreateCourseForm';
import axiosInstance from '../../api/axiosInstance';
import { updateCourse, deleteCourse, getCourseById } from '../../api/courses';
import { showErrorToast, showSuccessToast } from '../../components/Toast';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  sessions: number;
  sessionDuration: number;
  bufferTime: number;
}

interface DaySchedule {
  day: string;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface Course {
  id: string | number;
  title: string;
  description?: string;
  benefits?: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: string | number;  // API returns as string
  creditCost?: number;
  status: string;
  isActive?: boolean;
  isFrozen?: boolean;
  category: string;
  program?: string;
  duration: string | number;
  courseDuration?: string;
  timezone?: string;
  lessons: number;
  weeklySchedule?: DaySchedule[];
  videoThumbnail?: string;
  hasVideo?: boolean;
  videoUrl?: string;
  level?: string;
  currency?: string;
  location?: string;
  locationType?: string;
  ageRanges?: string[];
}

interface CoursesProps {
  courses: Course[];
}

// ThumbnailWithFallback component
function ThumbnailWithFallback({ thumbnail, title, generateTextThumbnail }) {
  const [imgError, setImgError] = React.useState(false);
  if (!thumbnail || thumbnail === "" || imgError) {
    return (
      <img
        src={generateTextThumbnail(title)}
        alt={title}
        className="w-full h-44 sm:h-48 object-cover"
      />
    );
  }
  return (
    <img
      src={thumbnail}
      alt={title}
      className="w-full h-44 sm:h-48 object-cover"
      onError={() => setImgError(true)}
    />
  );
}

const Courses: React.FC<CoursesProps> = ({ courses }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [localCourses, setLocalCourses] = useState<Course[]>(courses);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit loading state
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  
  // Filter states - simplified
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDay, setSelectedDay] = useState<string>('All Days');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filtered courses with search functionality
  const filteredCourses = useMemo(() => {
    return localCourses.filter(course => {
      // Status filter
      if (selectedStatus !== 'All') {
        const normalizedStatus = course.status?.toLowerCase();
        const isFrozen = !!course.isFrozen;
        const isDeactivated = (normalizedStatus === 'approved' || normalizedStatus === 'active') && course.isActive === false;
        const matches = (
          (selectedStatus === 'Approved' && (normalizedStatus === 'active' || normalizedStatus === 'approved') && course.isActive !== false) ||
          (selectedStatus === 'Pending' && normalizedStatus === 'pending' && !isFrozen) ||
          (selectedStatus === 'Rejected' && normalizedStatus === 'rejected') ||
          (selectedStatus === 'Frozen' && normalizedStatus === 'pending' && isFrozen) ||
          (selectedStatus === 'Deactivated' && isDeactivated)
        );
        if (!matches) {
          return false;
        }
      }
      
      // Day filter
      if (selectedDay !== 'All Days') {
        const hasScheduleForDay = course.weeklySchedule?.some(daySchedule => 
          daySchedule.isActive && 
          daySchedule.day.toLowerCase().includes(selectedDay.toLowerCase()) &&
          daySchedule.timeSlots.length > 0
        );
        if (!hasScheduleForDay) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          course.title.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query) ||
          course.status.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [localCourses, selectedStatus, selectedDay, searchQuery]);

  // Sync local courses when parent prop changes (API updates)
  useEffect(() => {
    setLocalCourses(courses || []);
  }, [courses]);

  // Load shared courses from localStorage on component mount
  useEffect(() => {
    const sharedCourses = JSON.parse(localStorage.getItem('sharedCourses') || '[]');
    if (sharedCourses.length > 0) {
      setLocalCourses(prev => {
        // Merge shared courses with existing courses, avoiding duplicates
        const existingIds = new Set(prev.map(course => course.id));
        const newSharedCourses = sharedCourses.filter((course: Course) => !existingIds.has(course.id));
        return [...newSharedCourses, ...prev];
      });
    }
  }, []);

  // Function to generate modern text-based thumbnail with proper text handling
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
    
    // Function to wrap text into multiple lines
  const wrapText = (text: string, maxCharsPerLine: number = 20): string[] => {
      const words: string[] = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Handle very long single words
            if (word.length > maxCharsPerLine) {
              lines.push(word.substring(0, maxCharsPerLine - 3) + '...');
              currentLine = '';
            } else {
              currentLine = word;
            }
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Limit to maximum 3 lines
      if (lines.length > 3) {
        const third: string = String(lines[2] || '');
        lines[2] = third.substring(0, 17) + '...';
        return lines.slice(0, 3);
      }
      
      return lines;
    };
    
    const textLines = wrapText(title);
    const lineHeight = 28;
    const startY = textLines.length === 1 ? 140 : 
                   textLines.length === 2 ? 125 : 115;
    
    // Adjust font size based on text length
  const fontSize = textLines.length > 2 ? 24 : textLines.some((line: string) => line.length > 15) ? 26 : 32;
    
    // Create SVG with modern design and proper text wrapping
    const svg = `
      <svg width="400" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
          <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.4"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="240" fill="url(#gradient)" rx="12"/>
        
        <!-- Decorative elements -->
        <circle cx="320" cy="60" r="40" fill="rgba(255,255,255,0.08)" opacity="0.6"/>
        <circle cx="80" cy="180" r="30" fill="rgba(255,255,255,0.08)" opacity="0.6"/>
        <circle cx="350" cy="200" r="20" fill="rgba(255,255,255,0.08)" opacity="0.6"/>
        
        <!-- Background overlay for better text readability -->
        <rect x="20" y="${startY - 20}" width="360" height="${textLines.length * lineHeight + 40}" 
              fill="rgba(0,0,0,0.1)" rx="8" opacity="0.3"/>
        
        <!-- Main text lines -->
        ${textLines.map((line, index) => `
          <text x="200" y="${startY + (index * lineHeight)}" 
                font-family="Inter, system-ui, -apple-system, sans-serif" 
                font-size="${fontSize}" 
                font-weight="700" 
                text-anchor="middle" 
                fill="white" 
                filter="url(#textShadow)">
            ${line}
          </text>
        `).join('')}
        
        <!-- Subtitle -->
        <text x="200" y="${startY + (textLines.length * lineHeight) + 25}" 
              font-family="Inter, system-ui, -apple-system, sans-serif" 
              font-size="12" 
              font-weight="500" 
              text-anchor="middle" 
              fill="rgba(255,255,255,0.9)"
              filter="url(#textShadow)">
          Course
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(svgBlob);
  };

  // Helper function to format time display
  const formatTimeDisplay = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum === 0 ? '12:00 AM' : hourNum < 12 ? `${hourNum}:00 AM` : hourNum === 12 ? '12:00 PM' : `${hourNum - 12}:00 PM`;
  };

  const handleCreateCourse = async (courseData: any) => {
    // Build multipart form data per backend contract
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('benefits', courseData.benefits);
    formData.append('category', courseData.category);
    formData.append('program', courseData.program || '');
    formData.append('credits', courseData.credits); // send as number
    formData.append('timezone', courseData.timezone);
    formData.append('location', courseData.location || '');
    formData.append('locationType', courseData.locationType || 'online');
    formData.append('ageRanges', JSON.stringify(courseData.ageRanges || []));
    // Optional fields
    if (courseData.duration) {
      formData.append('duration', courseData.duration);
    }
    if (courseData.courseDuration) {
      formData.append('courseDuration', courseData.courseDuration);
    }
    formData.append('weeklySchedule', JSON.stringify(courseData.weeklySchedule || []));
    if (courseData.thumbnail instanceof File) {
      formData.append('thumbnail', courseData.thumbnail);
    }
    if (courseData.introVideo instanceof File) {
      formData.append('introVideo', courseData.introVideo);
    }

    const resp = await axiosInstance.post('/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const created = resp.data?.data || resp.data;
    // Update local list with server response
    // Only use 'active', 'pending', 'rejected' for status
    let statusLabel = 'pending';
    if (created.status && typeof created.status === 'string') {
      const s = created.status.toLowerCase();
      if (s === 'approved' || (created.isActive && s !== 'rejected')) statusLabel = 'active';
      else if (s === 'rejected') statusLabel = 'rejected';
      else statusLabel = 'pending';
    } else if (created.isActive) {
      statusLabel = 'active';
    }
    const newCourse: Course = {
      id: created.id,
      title: created.title,
      thumbnail: created.thumbnail || generateTextThumbnail(created.title),
      students: 0,
      rating: 0,
      price: Number(created.creditCost || courseData.credits || 0),
      status: statusLabel,
      category: created.category,
      duration: created.courseDuration || '—',
      lessons: 0,
      weeklySchedule: created.weeklySchedule || courseData.weeklySchedule,
      videoThumbnail: '',
      hasVideo: Boolean(created.videoUrl)
    };

    setLocalCourses(prev => [newCourse, ...prev]);
    setShowCreateForm(false);
  };

  const handleEditCourse = async (course: Course) => {
    console.log('[Coach] Editing course:', course);
    console.log('[Coach] Course data fields:', {
      title: course.title,
      description: course.description,
      benefits: course.benefits,
      category: course.category,
      program: course.program,
      price: course.price,
      timezone: course.timezone,
      courseDuration: course.courseDuration,
      weeklySchedule: course.weeklySchedule
    });
    
    setIsLoadingEditData(true);
    
    try {
      // Fetch complete course details from API
      console.log('[Coach] Fetching complete course details for editing...');
      const response = await getCourseById(course.id);
      console.log('[Coach] Complete course details response:', response);
      
      let fullCourseData;
      if (response.data?.success && response.data?.data) {
        fullCourseData = response.data.data;
      } else if (response.data?.data) {
        fullCourseData = response.data.data;
      } else if (response.data) {
        fullCourseData = response.data;
      } else {
        throw new Error('Invalid API response');
      }
      
      console.log('[Coach] Full course data for editing:', fullCourseData);
      
      // Use the complete course data for editing
      const completeEditingCourse: Course = {
        ...course,
        ...fullCourseData,
        // Ensure we have all the fields
        id: course.id,
        title: fullCourseData.title || course.title,
        description: fullCourseData.description || '',
        benefits: fullCourseData.benefits || '',
        category: fullCourseData.category || course.category,
        program: fullCourseData.program || '',
        price: fullCourseData.price || course.price || 0,
        timezone: fullCourseData.timezone || '',
        courseDuration: fullCourseData.courseDuration || '',
        weeklySchedule: fullCourseData.weeklySchedule || course.weeklySchedule || []
      };
      
      console.log('[Coach] Complete editing course object:', completeEditingCourse);
      
      setEditingCourse(completeEditingCourse);
      setShowEditForm(true);
      
    } catch (error) {
      console.error('[Coach] Failed to fetch course details for editing:', error);
      showErrorToast('Failed to load course details for editing. Please try again.');
    } finally {
      setIsLoadingEditData(false);
    }
  };

  const handleUpdateCourse = async (courseData: any) => {
    if (!editingCourse) return;

    try {
      console.log(`[Coach] Updating course: ${editingCourse.id}`);
      console.log('[Coach] Form data received:', courseData);
      
      // Prepare FormData for API call - match the backend validation schema
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description || '');
      formData.append('benefits', courseData.benefits || '');
      formData.append('category', courseData.category);
      formData.append('program', courseData.program || '');
      formData.append('credits', String(courseData.credits) || '0');
      formData.append('courseDuration', courseData.duration || courseData.courseDuration || '');
      formData.append('timezone', courseData.timezone || '');
      formData.append('location', courseData.location || '');
      formData.append('locationType', courseData.locationType || 'online');
      formData.append('ageRanges', JSON.stringify(courseData.ageRanges || []));
      formData.append('weeklySchedule', JSON.stringify(courseData.weeklySchedule || []));
      
      // Handle file uploads
      if (courseData.thumbnail instanceof File) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      if (courseData.introVideo instanceof File) {
        formData.append('introVideo', courseData.introVideo);
      }

      console.log('[Coach] Sending update FormData:', formData);

      // Call the PUT API with FormData
      const response = await axiosInstance.put(`/courses/${editingCourse.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('[Coach] Update response:', response);
      
      // Handle the response
      let updatedCourseData;
      if (response.data?.success && response.data?.data) {
        updatedCourseData = response.data.data;
      } else if (response.data?.data) {
        updatedCourseData = response.data.data;
      } else if (response.data) {
        updatedCourseData = response.data;
      } else {
        throw new Error('Invalid API response');
      }

      // Update the course in the local state with all the fields
      const updatedCourse: Course = {
        ...editingCourse,
        ...updatedCourseData,
        // Ensure we maintain the local structure and handle field mappings
        title: updatedCourseData.title || courseData.title,
        description: updatedCourseData.description || courseData.description,
        benefits: updatedCourseData.benefits || courseData.benefits,
        category: updatedCourseData.category || courseData.category,
        program: updatedCourseData.program || courseData.program,
        price: updatedCourseData.price || String(courseData.credits),
        courseDuration: updatedCourseData.courseDuration || courseData.duration,
        timezone: updatedCourseData.timezone || courseData.timezone,
        weeklySchedule: updatedCourseData.weeklySchedule || courseData.weeklySchedule
      };

      console.log('[Coach] Updated course object:', updatedCourse);

      setLocalCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? updatedCourse : course
      ));
      
      showSuccessToast(`Course "${courseData.title}" has been updated successfully.`);
      
      setShowEditForm(false);
      setEditingCourse(null);
      
    } catch (error) {
      console.error('[Coach] Failed to update course:', error);
      console.error('[Coach] Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update course. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors (422)
        if (error.response.status === 422) {
          if (errorData.data && Array.isArray(errorData.data)) {
            // Extract validation error messages
            const validationErrors = errorData.data.map(err => err.message || err).join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          } else if (errorData.message) {
            errorMessage = `Validation failed: ${errorData.message}`;
          } else {
            errorMessage = 'Please check all required fields and try again.';
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorToast(errorMessage);
    }
  };

  const handleAddVideo = (course: Course) => {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.multiple = false;
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          alert('Video file size must be less than 100MB');
          document.body.removeChild(fileInput);
          return;
        }
        
        // Validate file type
        const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid video file (MP4, MOV, AVI, WMV, FLV)');
          document.body.removeChild(fileInput);
          return;
        }
        
        // Handle video upload - you can add your video upload logic here
        console.log('Video uploaded for course:', course.title, file);
        
        // Create video thumbnail (you can replace this with actual video thumbnail generation)
        const videoThumbnail = generateTextThumbnail('Video');
        
        // Update the course object to reflect the new video
        setLocalCourses(prev => prev.map(c => 
          c.id === course.id ? { 
            ...c, 
            hasVideo: true, 
            videoThumbnail: videoThumbnail 
          } : c
        ));
        
        // Show success message with better UX
        const successMessage = `✅ Video "${file.name}" uploaded successfully for course "${course.title}"`;
        alert(successMessage);
      }
      // Clean up
      document.body.removeChild(fileInput);
    };
    
    // Add to DOM and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      console.log(`[Coach] Deleting course: ${courseToDelete.id}`);
      console.log(`[Coach] Course details:`, courseToDelete);
      console.log(`[Coach] API Call: DELETE /api/v1/courses/${courseToDelete.id}`);
      
      // First, let's try to get the course details to see if it exists
      try {
        const courseCheck = await getCourseById(courseToDelete.id);
        console.log('[Coach] Course exists, proceeding with deletion:', courseCheck.data);
      } catch (checkError) {
        console.log('[Coach] Course check failed:', checkError);
        if (checkError.response?.status === 404) {
          showErrorToast('Course not found. It may have already been deleted.');
          setShowDeleteConfirm(false);
          setCourseToDelete(null);
          setIsDeleting(false);
          return;
        }
      }
      
      const response = await deleteCourse(courseToDelete.id);
      console.log('[Coach] Delete response:', response);
      
      // Remove from local state
      setLocalCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
      
      showSuccessToast(`Course "${courseToDelete.title}" has been deleted successfully.`);
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
      
    } catch (error) {
      console.error('[Coach] Failed to delete course:', error);
      console.error('[Coach] Error response:', error.response);
      console.error('[Coach] Error data:', error.response?.data);
      
      let errorMessage = 'Failed to delete course. Please try again.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle different error response formats
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Handle specific error cases
        if (errorMessage.includes('foreign key constraint') || 
            errorMessage.includes('related records') ||
            errorMessage.includes('enrolled students')) {
          errorMessage = 'Cannot delete this course because it has enrolled students or related data. Please contact support if you need to remove this course.';
        } else if (errorMessage.includes('not found')) {
          errorMessage = 'Course not found. It may have already been deleted.';
          // Remove from local state since it doesn't exist
          setLocalCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
        } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
          errorMessage = 'You do not have permission to delete this course.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error occurred. The course may have related data that prevents deletion. Please contact support.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorToast(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteCourse = () => {
    setShowDeleteConfirm(false);
    setCourseToDelete(null);
  };

  const handleViewDetails = (courseId: string | number) => {
    console.log(`[Coach] Opening course details modal for course ID: ${courseId}`);
    setSelectedCourseId(courseId);
    setShowDetailsModal(true);
  };

  // Utility: pick a gradient based on course title for variety
  function getGradient(title: string) {
    const gradients = [
      "bg-gradient-to-r from-blue-500 to-purple-600",
      "bg-gradient-to-r from-green-400 to-emerald-500",
      "bg-gradient-to-r from-pink-500 to-yellow-500",
      "bg-gradient-to-r from-indigo-500 to-blue-400",
      "bg-gradient-to-r from-orange-400 to-red-500",
      "bg-gradient-to-r from-teal-400 to-cyan-500",
      "bg-gradient-to-r from-fuchsia-500 to-pink-500"
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Courses</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage and track your course performance</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base font-medium"
        >
          <FaPlus className="text-sm sm:text-base" />
          <span className="hidden sm:inline">Create New Course</span>
          <span className="sm:hidden">Create Course</span>
        </button>
      </div>

      {/* Search and Filters - Professional Layout */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        
        {/* Search Bar Row */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Status Filter Section */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Status:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'All', label: 'All', count: localCourses.length },
                { key: 'Approved', label: 'Approved', count: localCourses.filter(c => (c.status === 'active' || c.status === 'approved') && c.isActive !== false).length },
                { key: 'Pending', label: 'Pending', count: localCourses.filter(c => c.status === 'pending' && !c.isFrozen).length },
                { key: 'Frozen', label: 'Frozen', count: localCourses.filter(c => c.status === 'pending' && c.isFrozen).length },
                { key: 'Deactivated', label: 'Deactivated', count: localCourses.filter(c => (c.status === 'approved' || c.status === 'active') && c.isActive === false).length },
                { key: 'Rejected', label: 'Rejected', count: localCourses.filter(c => c.status === 'rejected').length }
              ].map((status) => (
                <button
                  key={status.key}
                  onClick={() => setSelectedStatus(status.key)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedStatus === status.key
                      ? status.key === 'All' ? 'bg-indigo-500 text-white shadow-sm' :
                        status.key === 'Approved' ? 'bg-green-500 text-white shadow-sm' :
                        status.key === 'Pending' ? 'bg-orange-500 text-white shadow-sm' :
                        status.key === 'Frozen' ? 'bg-sky-600 text-white shadow-sm' :
                        status.key === 'Deactivated' ? 'bg-gray-600 text-white shadow-sm' :
                        'bg-red-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <span>{status.label}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedStatus === status.key ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                  }`}>
                    {status.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Day Filter Section */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Schedule Day:</label>
            <div className="relative min-w-[180px]">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-colors"
                aria-label="Filter by schedule day"
              >
                <option value="All Days">
                  All Days ({localCourses.filter(c => c.weeklySchedule?.some(d => d.isActive && d.timeSlots.length > 0)).length})
                </option>
                {[
                  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
                ].map((day) => {
                  const dayCount = localCourses.filter(c => 
                    c.weeklySchedule?.some(d => 
                      d.isActive && 
                      d.day.toLowerCase().includes(day.toLowerCase()) && 
                      d.timeSlots.length > 0
                    )
                  ).length;
                  
                  return (
                    <option key={day} value={day}>
                      {day} ({dayCount})
                    </option>
                  );
                })}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || selectedStatus !== 'All' || selectedDay !== 'All Days') && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredCourses.length}</span> of <span className="font-medium">{localCourses.length}</span> courses
              {searchQuery && (
                <span> matching "<span className="font-medium text-indigo-600">{searchQuery}</span>"</span>
              )}
              {selectedDay !== 'All Days' && (
                <span> scheduled on <span className="font-medium text-blue-600">{selectedDay}</span></span>
              )}
              {selectedStatus !== 'All' && (
                <span> with <span className="font-medium text-gray-800">{selectedStatus.toLowerCase()}</span> status</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Clear search
                </button>
              )}
              {(selectedStatus !== 'All' || selectedDay !== 'All Days') && (
                <button
                  onClick={() => {
                    setSelectedStatus('All');
                    setSelectedDay('All Days');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredCourses.map((course) => (
          <div 
            key={course.id} 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
            onDoubleClick={() => handleViewDetails(course.id)}
            title="Double-click to view details"
          >
            <div className="relative overflow-hidden">
              {/* Thumbnail or Fallback with error handling */}
              <ThumbnailWithFallback 
                thumbnail={course.thumbnail} 
                title={course.title} 
                generateTextThumbnail={generateTextThumbnail} 
              />
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {course.status?.toLowerCase() === 'pending' && course.isFrozen && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-sky-600 text-white">Frozen</span>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                  (course.status === 'active' || course.status === 'approved') && course.isActive !== false ? 'bg-green-500 text-white' :
                  course.status === 'pending' ? 'bg-orange-500 text-white' :
                  course.status === 'rejected' ? 'bg-red-500 text-white' : 
                  'bg-gray-500 text-white'
                }`}>
                  {(() => {
                    const s = (course.status || '').toLowerCase();
                    if ((s === 'approved' || s === 'active') && course.isActive === false) return 'Deactivated';
                    if (s === 'active') return 'Approved';
                    return s.charAt(0).toUpperCase() + s.slice(1);
                  })()}
                </span>
              </div>
              
              {/* Price Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/80 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  ${course.price}
                </span>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2">
                <span className="bg-blue-500/90 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  {course.duration || '12 weeks'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1 mr-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-1 text-yellow-500 flex-shrink-0">
                  <FaStar className="text-xs" />
                  <span className="text-xs font-semibold">{course.rating}</span>
                </div>
              </div>
              
              {/* Category */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                  {course.category}
                </span>
              </div>
              
              {/* Schedule Information - Compact */}
              {course.weeklySchedule && course.weeklySchedule.some(day => day.isActive) && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-700">Schedule</span>
                    </div>
                    <span className="text-gray-500">
                      {course.weeklySchedule.filter(day => day.isActive).length} days/week
                    </span>
                  </div>
                  {/* Show first active day time */}
                  {course.weeklySchedule
                    .filter(day => day.isActive && day.timeSlots.length > 0)
                    .slice(0, 1)
                    .map((day, index) => (
                      <div key={day.day} className="mt-1 text-xs text-gray-600">
                        <span className="font-medium">{day.day.slice(0, 3)}</span>: {formatTimeDisplay(day.timeSlots[0].startTime)}
                        {day.timeSlots.length > 1 && <span className="text-gray-400"> +{day.timeSlots.length - 1}</span>}
                      </div>
                    ))}
                </div>
              )}

              {/* Video Indicator - Compact */}
              {course.hasVideo && course.videoThumbnail && (
                <div className="mb-3 flex items-center space-x-2 text-xs text-green-600">
                  <FaVideo className="w-3 h-3" />
                  <span className="font-medium">Video Available</span>
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="flex items-center gap-2">
                {/* Primary Action - View with different design */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(course.id);
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 px-3 rounded-lg font-medium text-xs transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-1"
                  title="View course details"
                >
                  <FaEye className="text-xs" />
                  <span>Details</span>
                </button>

                {/* Secondary Actions - More compact */}
                <div className="flex items-center gap-1">
                  {/* Edit Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const canEdit = course.status?.toLowerCase() === 'pending' && !course.isFrozen;
                      if (!canEdit) {
                        showErrorToast(course.status?.toLowerCase() !== 'pending' ? 'Only pending courses can be edited' : 'Course is frozen by admin');
                        return;
                      }
                      handleEditCourse(course);
                    }}
                    disabled={isLoadingEditData || course.status?.toLowerCase() !== 'pending' || !!course.isFrozen}
                    className={`w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      course.status?.toLowerCase() === 'pending' && !course.isFrozen
                        ? 'bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    title={course.status?.toLowerCase() !== 'pending' ? 'Only pending courses can be edited' : (course.isFrozen ? 'Course is frozen by admin' : 'Edit course')}
                  >
                    {isLoadingEditData ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                    ) : (
                      <FaEdit className="text-xs" />
                    )}
                  </button>

                  {/* Add Video Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddVideo(course);
                    }}
                    className="w-9 h-9 bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                    title="Add video to course"
                  >
                    <FaVideo className="text-xs" />
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const s = (course.status || '').toLowerCase();
                      const isDeactivated = (s === 'approved' || s === 'active') && course.isActive === false;
                      if (isDeactivated) {
                        showErrorToast('Deactivated courses cannot be deleted.');
                        return;
                      }
                      handleDeleteCourse(course);
                    }}
                    disabled={(course.status === 'approved' || course.status === 'active') && course.isActive === false}
                    className={`w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center ${((course.status === 'approved' || course.status === 'active') && course.isActive === false) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600'}`}
                    title={((course.status === 'approved' || course.status === 'active') && course.isActive === false) ? 'Deactivated courses cannot be deleted' : 'Delete course'}
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Courses Found State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300 max-w-md mx-auto">
            <FaSearch className="text-4xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No courses found' : 
               selectedDay !== 'All Days' ? `No courses scheduled on ${selectedDay}` :
               'No courses match the selected filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No courses found for "${searchQuery}". Try adjusting your search terms.`
                : selectedDay !== 'All Days'
                  ? `No courses are scheduled on ${selectedDay}. Try selecting a different day or create a course with ${selectedDay} schedule.`
                  : selectedStatus === 'All' 
                    ? 'You haven\'t created any courses yet. Click "Create New Course" to get started.'
                    : `No courses with "${selectedStatus}" status found.`
              }
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Search
              </button>
            ) : (selectedStatus !== 'All' || selectedDay !== 'All Days') ? (
              <button
                onClick={() => {
                  setSelectedStatus('All');
                  setSelectedDay('All Days');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Your First Course
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Course Form Modal */}
      {showCreateForm && (
        <CreateCourseForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCourse}
        />
      )}

      {/* Edit Course Form Modal */}
      {showEditForm && editingCourse && (() => {
        console.log('[Coach] Rendering edit form with data:', {
          title: editingCourse.title || '',
          description: editingCourse.description || '',
          benefits: editingCourse.benefits || '',
          category: editingCourse.category || '',
          program: editingCourse.program || 'morning',
          credits: Number(editingCourse.price) || 0,
          timezone: editingCourse.timezone || '',
          location: editingCourse.location || '',
          locationType: (editingCourse.locationType as 'online' | 'in-person' | 'hybrid') || 'online',
          ageRanges: editingCourse.ageRanges || [],
          duration: editingCourse.courseDuration || editingCourse.duration || ''
        });
        return (
          <CreateCourseForm
            onClose={() => {
              setShowEditForm(false);
              setEditingCourse(null);
            }}
            onSubmit={handleUpdateCourse}
            initialData={{
              title: editingCourse.title || '',
              description: editingCourse.description || '',
              benefits: editingCourse.benefits || '',
              category: editingCourse.category || '',
              program: (['morning','afternoon','evening'].includes(String(editingCourse.program)) ? (editingCourse.program as 'morning'|'afternoon'|'evening') : 'morning'),
              credits: Number(editingCourse.price) || 0,  // API returns price as string
              timezone: editingCourse.timezone || '',
              location: editingCourse.location || '',
              locationType: (editingCourse.locationType as 'online' | 'in-person' | 'hybrid') || 'online',
              ageRanges: editingCourse.ageRanges || [],
              courseDuration: String(editingCourse.courseDuration || editingCourse.duration || ''),
              courseDurationNumber: typeof editingCourse.duration === 'number' ? editingCourse.duration : undefined,
              weeklySchedule: editingCourse.weeklySchedule || [
                { day: 'SUNDAYS', isActive: false, timeSlots: [] },
                { day: 'MONDAYS', isActive: false, timeSlots: [] },
                { day: 'TUESDAYS', isActive: false, timeSlots: [] },
                { day: 'WEDNESDAYS', isActive: false, timeSlots: [] },
                { day: 'THURSDAYS', isActive: false, timeSlots: [] },
                { day: 'FRIDAYS', isActive: false, timeSlots: [] },
                { day: 'SATURDAYS', isActive: false, timeSlots: [] }
              ]
            }}
            isEditing={true}
          />
        );
      })()}

      {/* Coach Course Details Modal */}
      <CoachCourseDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCourseId(null);
        }}
        courseId={selectedCourseId}
        onEdit={(courseId) => {
          const course = localCourses.find(c => c.id === courseId);
          if (course) {
            handleEditCourse(course);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Course</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete the course:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900">{courseToDelete.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {courseToDelete.category} • Status: {courseToDelete.status}
                </p>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete the course and all associated data.
                </p>
                <p className="text-xs text-red-600 mt-2">
                  <strong>Note:</strong> If this course has enrolled students or related sessions, 
                  deletion may not be possible. In such cases, please contact support for assistance.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={cancelDeleteCourse}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCourse}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Course'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Courses;