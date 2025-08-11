import { getGradient } from "../utils/getGradient";
import React from "react";
import { FaEye, FaGraduationCap, FaCalendarAlt } from "react-icons/fa";
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
}

interface CourseCardProps {
  course: Course;
  onViewDetails: (course: Course) => void;
  onEnroll: (course: Course) => void;
  onViewCoachDetails: (coachId: string) => void;
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
  return (
    <div className="p-4 sm:p-6">
      {/* Thumbnail or Fallback */}
      <div className="relative h-40 sm:h-48 rounded-xl overflow-hidden mb-4">
        {course.thumbnail && course.thumbnail !== "" ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`absolute inset-0 w-full h-full flex items-center justify-center text-white text-lg sm:text-xl font-bold select-none ${getGradient(course.title)}`}
          >
            {course.title}
          </div>
        )}
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
          onClick={() => onViewCoachDetails(course.coach.id)}
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
            {course.category}
          </span>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            {formatProgram(course.program)}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
            {course.credits} Credits
          </span>
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
