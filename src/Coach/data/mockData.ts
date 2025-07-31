import { FaBook, FaVideo, FaStar } from 'react-icons/fa';

// Mock data for courses
export const courses = [
  {
    id: 1,
    title: 'Advanced Calculus for High School',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop',
    students: 45,
    rating: 4.9,
    price: 89.99,
    status: 'active',
    progress: 85,
    category: 'Mathematics',
    duration: '12 weeks',
    lessons: 24
  },
  {
    id: 2,
    title: 'Physics Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=300&h=200&fit=crop',
    students: 32,
    rating: 4.7,
    price: 79.99,
    status: 'active',
    progress: 92,
    category: 'Physics',
    duration: '10 weeks',
    lessons: 20
  },
  {
    id: 3,
    title: 'Algebra Mastery Course',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop',
    students: 28,
    rating: 4.8,
    price: 69.99,
    status: 'draft',
    progress: 0,
    category: 'Mathematics',
    duration: '8 weeks',
    lessons: 16
  }
];

// Mock data for upcoming sessions
export const upcomingSessions = [
  {
    id: 1,
    student: 'Emma Wilson',
    course: 'Advanced Calculus',
    time: 'Today, 2:00 PM',
    duration: '60 min',
    type: 'One-on-One',
    status: 'confirmed'
  },
  {
    id: 2,
    student: 'Michael Chen',
    course: 'Physics Fundamentals',
    time: 'Tomorrow, 10:00 AM',
    duration: '45 min',
    type: 'Group Session',
    status: 'confirmed'
  },
  {
    id: 3,
    student: 'Alex Rodriguez',
    course: 'Algebra Mastery',
    time: 'Tomorrow, 4:30 PM',
    duration: '60 min',
    type: 'One-on-One',
    status: 'pending'
  }
];

// Mock data for recent activity
export const recentActivity = [
  {
    id: 1,
    type: 'course_created',
    title: 'New course published',
    description: 'Physics Fundamentals course is now live',
    time: '2 hours ago',
    icon: FaBook
  },
  {
    id: 2,
    type: 'video_uploaded',
    title: 'Video uploaded',
    description: 'Lesson 5: Newton\'s Laws uploaded',
    time: '4 hours ago',
    icon: FaVideo
  },
  {
    id: 3,
    type: 'review_received',
    title: 'New review received',
    description: '5-star review from Emma Wilson',
    time: '1 day ago',
    icon: FaStar
  }
];

// Mock analytics data
export const analytics = {
  monthlyEarnings: [3200, 4100, 3800, 5200, 4800, 6100],
  studentGrowth: [45, 52, 58, 65, 72, 80],
  courseViews: [1200, 1400, 1600, 1800, 2000, 2200],
  completionRate: 87
};

// Extended coach data for components
export const extendedCoachData = {
  name: 'Pugazhenthi',
  email: 'pugazhenthi962003@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  rating: 4.8,
  totalStudents: 156,
  totalCourses: 8,
  totalEarnings: 12450,
  experience: '5+ years',
  specialization: 'Mathematics & Physics'
};

// Export all data as a single object
export const mockData = {
  courses,
  upcomingSessions,
  recentActivity,
  analytics,
  extendedCoachData
}; 