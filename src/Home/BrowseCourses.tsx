import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getCourses({
          status: 'APPROVED',
          isActive: true
        });
        
        console.log('API Response:', response?.data);
        
        // Backend returns: { success: true, data: { courses: [...], pagination: {...} }, message: "..." }
        const coursesData = response?.data?.data?.courses || response?.data?.courses || [];
        
        // Normalize course data to match expected format
        const normalizedCourses: Course[] = coursesData.map((course: any) => {
          let program: 'morning' | 'afternoon' | 'evening' = 'morning';
          if (course.program === 'afternoon' || course.program === 'evening') {
            program = course.program;
          }
          
          return {
            id: String(course.id),
            title: course.title || 'Untitled Course',
            description: course.description || '',
            benefits: course.benefits || '',
            category: course.category || 'General',
            program: program || undefined, // Keep undefined if empty
            credits: Number(course.creditCost || course.credits || 0),
            timezone: course.timezone || 'UTC',
            weeklySchedule: course.weeklySchedule || [],
            thumbnail: course.thumbnail || '',
            introVideo: course.introVideo || course.videoUrl || '',
            coach: {
              id: String(course.coach?.id || course.coachId || ''),
              name: course.coach?.firstName && course.coach?.lastName
                ? `${course.coach.firstName} ${course.coach.lastName}`
                : course.coach?.name || 'Unknown Instructor',
              avatar: course.coach?.profileImageUrl || '',
              rating: course.coach?.rating || 0,
              totalReviews: course.coach?.totalReviews || 0,
              firstName: course.coach?.firstName || '',
              lastName: course.coach?.lastName || '',
              email: course.coach?.email || '',
              phone: course.coach?.phone || '',
              status: course.coach?.status || 'approved',
              domain: course.coach?.domain || '',
              experience: course.coach?.experienceDescription || '',
              address: course.coach?.address || '',
              languages: course.coach?.languages || [],
              courses: course.coach?.courses || []
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
    };

    fetchCourses();
  }, []);

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
