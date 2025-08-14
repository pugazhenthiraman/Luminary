import { getGradient } from "../utils/getGradient";
import { validateThumbnailUrl } from "../utils/thumbnailUtils";
import React, { useState, useEffect } from "react";
import { FaEye, FaGraduationCap, FaCalendarAlt, FaCreditCard } from "react-icons/fa";
import Avatar from "./Avatar";

interface Coach {
  id: string;
  name: string;
  avatar?: string;
}

interface TimeSlot {
  startTime: string;
}

interface WeeklyDay {
  day: string;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface Course {
  id: string;
  title: string;
  coach: Coach;
  description: string;
  category: string;
  program: string;
  credits: number;
  weeklySchedule: WeeklyDay[];
  thumbnail?: string;
  price?: number; // Optional USD price if available
}

interface CourseCardProps {
  course: Course;
  onViewDetails: (course: Course) => void;
  onEnroll: (course: Course) => void;
  onViewCoachDetails: (courseId: string) => void;
  formatProgram: (program: string) => string;
  formatTime: (time: string) => string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onEnroll,
  onViewCoachDetails,
  formatProgram,
  formatTime,
}) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);

  useEffect(() => {
    if (course.thumbnail && validateThumbnailUrl(course.thumbnail)) {
      setThumbnailLoading(true);
      setThumbnailError(false);
    } else {
      setThumbnailLoading(false);
      setThumbnailError(true);
    }
  }, [course.thumbnail]);

  const handleThumbnailLoad = () => {
    console.log(`[CourseCard] Successfully loaded thumbnail for: ${course.title}`);
    setThumbnailLoading(false);
    setThumbnailError(false);
  };

  const handleThumbnailError = () => {
    console.warn(`[CourseCard] Failed to load thumbnail for: ${course.title}, URL: ${course.thumbnail}`);
    setThumbnailLoading(false);
    setThumbnailError(true);
  };
  return (
    <div className="p-4 sm:p-6">
      {/* Thumbnail or Fallback */}
      <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-4">
        {course.thumbnail && !thumbnailError ? (
          <>
            {!thumbnailLoading && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                onLoad={handleThumbnailLoad}
                onError={handleThumbnailError}
              />
            )}
            {thumbnailLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </>
        ) : null}
        {(!course.thumbnail || thumbnailError || thumbnailLoading) && (
          <div
            className={`absolute inset-0 w-full h-full flex items-center justify-center text-white text-lg sm:text-xl font-bold select-none ${getGradient(course.title)}`}
          >
            <div className="text-center px-4">
              <div className="mb-2">{course.title}</div>
              {thumbnailError && course.thumbnail && (
                <div className="text-xs opacity-75">Image failed to load</div>
              )}
            </div>
          </div>
        )}
        {/* Credits/Price badge */}
        <div className="absolute top-2 right-2">
          <div className="backdrop-blur-sm bg-white/90 text-gray-900 rounded-full px-2.5 py-1 shadow-sm border border-white/70 flex items-center gap-1">
            <FaCreditCard className="text-blue-600 text-xs" />
            <span className="text-[11px] font-semibold">
              {typeof course.price === 'number' ? `$${course.price}` : `${course.credits} Credits`}
            </span>
          </div>
        </div>
      </div>


      {/* Course Title and Coach */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {course.title}
      </h3>
      <div className="flex items-center space-x-2 mb-3">
        <Avatar
          name={course.coach.name}
          imageUrl={course.coach.avatar}
          size={24}
          className="w-5 h-5 sm:w-6 sm:h-6"
        />
        <span className="text-xs sm:text-sm text-gray-600 truncate">{course.coach.name}</span>
        <button
          onClick={() => onViewCoachDetails(course.id)}
          className="text-blue-600 hover:text-blue-700 text-xs font-medium hover:scale-105 transition-all duration-200"
        >
          View Profile
        </button>
      </div>

      {/* Course Description */}
      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
        {course.description}
      </p>

      {/* Key Info Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {course.category}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            {formatProgram(course.program)}
          </span>
        </div>
      </div>

      {/* Prominent price row */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between">
          <div className="text-gray-900 font-extrabold text-lg sm:text-xl">
            {typeof course.price === 'number' ? (
              <span>USD ${course.price}</span>
            ) : (
              <span>{course.credits} Credits</span>
            )}
          </div>
          <div className="hidden sm:flex items-center text-xs text-gray-500">
            <FaCalendarAlt className="text-indigo-600 mr-1" />
            <span>
              {course.weeklySchedule.filter(d=>d.isActive).length} days/week
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Preview */}
  <div className="mb-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
          <FaCalendarAlt className="text-indigo-600 text-xs sm:text-sm" />
          <span className="truncate">
            {course.weeklySchedule
              .filter((day) => day.isActive)
              .slice(0, 2)
              .map((day, index) => (
                <span key={index}>
                  {day.day.slice(0, -1)} {day.timeSlots[0] && formatTime(day.timeSlots[0].startTime)}
                  {index <
                    Math.min(
                      2,
                      course.weeklySchedule.filter((d) => d.isActive).length - 1
                    ) && ", "}
                </span>
              ))}
            {course.weeklySchedule.filter((day) => day.isActive).length > 2 && (
              <span className="text-blue-600">
                +{course.weeklySchedule.filter((day) => day.isActive).length - 2} more
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onViewDetails(course)}
          className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105"
        >
          <FaEye className="inline mr-1 text-xs sm:text-sm" />
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">Details</span>
        </button>
        <button
          onClick={() => onEnroll(course)}
          className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <FaGraduationCap className="inline mr-1 text-xs sm:text-sm" />
          Enroll
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
