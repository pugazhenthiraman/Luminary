import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses } from '../api/courses';
import { showErrorToast } from '../components/Toast';
import { FaGraduationCap, FaSpinner, FaLock } from 'react-icons/fa';
import Courses from '../Parent/components/Courses';

interface Course {
  id: string;
  title: string;
  description: string;
  benefits: string;
  category: string;
  program?: 'morning' | 'afternoon' | 'evening'; // Optional
  credits: number;
  timezone: string;
  weeklySchedule: any[];
  thumbnail: string;
  introVideo?: string;
  createdAt?: string;
  // Location fields
  city?: string;
  state?: string;
  zipcode?: string;
  location?: string;
  locationType?: string;
  distance?: number;
  distanceKm?: number;
  distanceFormatted?: string;
  coach: {
    id: string;
    name: string;
    avatar: string;
    rating?: number;
    totalReviews?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: string;
    domain?: string;
    experience?: string;
    address?: string;
    languages?: string[];
    courses?: any[];
  };
}

const BrowseCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Track location to prevent infinite loops
  const locationRef = useRef<string>('');

  // Fetch courses with location-based sorting
  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Priority 1: Get user location from localStorage (if manually set)
      // For public users (not logged in), only localStorage is available
      const savedLocation = localStorage.getItem('userLocation');
      const savedRadius = localStorage.getItem('searchRadius');
      let locationParams: any = {};
      let useLocation = false;
      
      // Check localStorage for saved location
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          if (location.zipcode) {
            locationParams.zipcode = location.zipcode;
            const radiusValue = savedRadius ? parseInt(savedRadius, 10) : 10;
            locationParams.radius = radiusValue;
            locationParams.sortBy = 'distance'; // Sort by distance when location is provided
            locationParams.sortOrder = 'asc'; // Nearest first
            useLocation = true;
            
            // Store location key to detect changes (includes both zipcode AND radius)
            const locationKey = `${location.zipcode}-${radiusValue}`;
            locationRef.current = locationKey;
          }
        } catch (e) {
          console.error('Error loading saved location:', e);
        }
      }
      
      // Prepare API params
      const apiParams: any = {
        status: 'APPROVED',
        isActive: true,
        page: 1,
        limit: 50,
        ...(useLocation ? {
          sortBy: 'distance',
          sortOrder: 'asc',
          ...locationParams
        } : {
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
      };
      
      const response = await getCourses(apiParams);
      
      console.log('API Response:', response?.data);
      
      // Backend returns: { success: true, data: { courses: [...], pagination: {...} }, message: "..." }
      const coursesData = response?.data?.data?.courses || response?.data?.courses || [];
      
      // Normalize course data to match expected format
      const normalizedCourses: Course[] = coursesData.map((course: any) => {
        let program: 'morning' | 'afternoon' | 'evening' = 'morning';
        if (course.program === 'afternoon' || course.program === 'evening') {
          program = course.program;
        }
        
        // Extract coach information from the nested coach object
        const coach = course.coach || {};
        const coachName = coach.firstName && coach.lastName
          ? `${coach.firstName} ${coach.lastName}`.trim()
          : coach.name || 'Unknown Coach';
        
        return {
          id: String(course.id),
          title: course.title || 'Untitled Course',
          description: course.description || '',
          benefits: course.benefits || '',
          category: course.category || 'General',
          program: program || undefined, // Keep undefined if empty
          credits: Number(course.creditCost || course.credits || 0),
          timezone: course.timezone || 'UTC',
          createdAt: course.createdAt || new Date().toISOString(),
          weeklySchedule: Array.isArray(course.weeklySchedule) ? course.weeklySchedule : [],
          thumbnail: course.thumbnail || '',
          introVideo: course.introVideo || course.videoUrl || '',
          // Location fields
          location: course.location || '',
          locationType: course.locationType || '',
          city: course.city || '',
          state: course.state || '',
          zipcode: course.zipcode || '',
          distance: course.distance !== undefined ? Number(course.distance) : undefined,
          distanceKm: course.distanceKm !== undefined ? Number(course.distanceKm) : undefined,
          distanceFormatted: course.distanceFormatted || (course.distance !== undefined ? `${Number(course.distance).toFixed(1)} miles` : undefined),
          coach: {
            id: String(coach.id || ''),
            name: coachName,
            avatar: coach.avatar || coach.profileImageUrl || '',
            rating: Number(coach.rating || 0),
            totalReviews: Number(coach.totalReviews || 0),
            firstName: coach.firstName || '',
            lastName: coach.lastName || '',
            email: coach.email || '',
            phone: coach.phone || '',
            status: coach.status || 'approved',
            domain: coach.domain || '',
            experience: coach.experienceDescription || '',
            address: coach.address || '',
            languages: Array.isArray(coach.languages) ? coach.languages : [],
            courses: coach.courses || []
          }
        };
      });
      
      setCourses(normalizedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showErrorToast('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - function doesn't depend on any props or state

  // Initial fetch on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // fetchCourses is stable (useCallback with empty deps)

  // Listen for location and radius changes and refetch courses
  useEffect(() => {
    const handleLocationChange = () => {
      // Check if location or radius actually changed
      const savedLocation = localStorage.getItem('userLocation');
      const savedRadius = localStorage.getItem('searchRadius');
      
      // Create location key that includes both zipcode AND radius
      let locationKey = '';
      
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          if (location.zipcode) {
            locationKey = `${location.zipcode}-${savedRadius || 10}`;
          }
        } catch (e) {
          console.error('Error handling location change:', e);
        }
      }
      
      // Only refetch if location or radius actually changed
      if (locationRef.current !== locationKey) {
        console.log('[BrowseCourses] Location or radius changed, refetching courses...', {
          previous: locationRef.current,
          current: locationKey
        });
        locationRef.current = locationKey; // Update ref before fetching
        fetchCourses();
      }
    };

    // Listen for location changes (dispatched by LocationSelector or Courses component)
    window.addEventListener('locationChanged', handleLocationChange);
    
    // Also listen for storage events in case localStorage changes from another tab/window
    window.addEventListener('storage', handleLocationChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('locationChanged', handleLocationChange);
      window.removeEventListener('storage', handleLocationChange);
    };
  }, [fetchCourses]); // Include fetchCourses in dependencies since it's stable (useCallback)

  // Redirect to login when trying to enroll
  const handleEnroll = (course: Course) => {
    navigate('/loginParent');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Explore Our Courses
              </h1>
              <p className="text-lg text-blue-100">
                Browse our wide selection of courses taught by expert instructors
              </p>
            </div>
            <Link
              to="/loginParent"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg"
            >
              Sign In to Enroll
              <FaGraduationCap className="ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-2 text-blue-800">
            <FaLock className="text-sm" />
            <p className="text-sm font-medium">
              You need to sign in to enroll in courses. 
              <Link to="/loginParent" className="ml-1 underline hover:text-blue-900">
                Login or create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid - Using the same component from Parent Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <FaSpinner className="animate-spin text-blue-600 text-4xl" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Loading courses...</h3>
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we fetch the latest courses for you.
            </p>
          </div>
        ) : (
          <Courses 
            courses={courses} 
            parentData={null} 
            loading={loading}
            // Override enroll behavior to redirect to login
            onEnroll={handleEnroll}
          />
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Create an account to enroll in courses, manage your children's progress, and access exclusive features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/loginParent"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              Login to Your Account
            </Link>
            <Link
              to="/register/parent"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseCourses;
