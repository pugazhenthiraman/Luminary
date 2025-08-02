export interface Course {
  id: string;
  title: string;
  description: string;
  benefits: string;
  category: string;
  program: 'morning' | 'afternoon' | 'evening';
  credits: number;
  timezone: string;
  weeklySchedule: {
    day: string;
    isActive: boolean;
    timeSlots: {
      startTime: string;
      endTime: string;
      sessions: number;
      sessionDuration: number;
      bufferTime: number;
    }[];
  }[];
  thumbnail: string;
  introVideo?: string;
  coach: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  childName: string;
  childId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  nextSession: string;
  coachName: string;
  totalSessions: number;
  completedSessions: number;
  grade: string;
  feedback: string;
}

export interface Session {
  id: string;
  courseId: string;
  courseTitle: string;
  childName: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  coachName: string;
  topic: string;
  meetingLink?: string;
}

export const mockData = {
  verifiedCourses: [
    {
      id: '1',
      title: 'Advanced Mathematics for Grade 8',
      description: 'Comprehensive mathematics course covering algebra, geometry, and problem-solving techniques designed for 8th-grade students.',
      benefits: 'Students will develop strong mathematical thinking, problem-solving skills, and confidence in handling complex mathematical concepts.',
      category: 'Academic Enrichment',
      program: 'afternoon',
      credits: 3,
      timezone: 'EST',
      weeklySchedule: [
        {
          day: 'MONDAYS',
          isActive: true,
          timeSlots: [
            {
              startTime: '16:00',
              endTime: '17:30',
              sessions: 12,
              sessionDuration: 90,
              bufferTime: 15
            }
          ]
        },
        {
          day: 'WEDNESDAYS',
          isActive: true,
          timeSlots: [
            {
              startTime: '16:00',
              endTime: '17:30',
              sessions: 12,
              sessionDuration: 90,
              bufferTime: 15
            }
          ]
        }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      introVideo: 'https://example.com/intro-video.mp4',
      coach: {
        id: 'c1',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      title: 'Creative Writing Workshop',
      description: 'An engaging writing workshop that helps students develop their creative writing skills through storytelling and poetry.',
      benefits: 'Students will enhance their writing abilities, creativity, and self-expression while building confidence in their communication skills.',
      category: 'Creative Arts',
      program: 'morning',
      credits: 2,
      timezone: 'PST',
      weeklySchedule: [
        {
          day: 'TUESDAYS',
          isActive: true,
          timeSlots: [
            {
              startTime: '09:00',
              endTime: '10:30',
              sessions: 8,
              sessionDuration: 90,
              bufferTime: 10
            }
          ]
        },
        {
          day: 'THURSDAYS',
          isActive: true,
          timeSlots: [
            {
              startTime: '09:00',
              endTime: '10:30',
              sessions: 8,
              sessionDuration: 90,
              bufferTime: 10
            }
          ]
        }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
      introVideo: 'https://example.com/writing-intro.mp4',
      coach: {
        id: 'c2',
        name: 'Emily Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: '3',
      title: 'Coding Fundamentals for Kids',
      description: 'Introduction to programming concepts using fun, interactive projects that teach logical thinking and problem-solving.',
      benefits: 'Students will learn basic programming concepts, develop logical thinking, and create their own digital projects.',
      category: 'Technology & STEM',
      program: 'evening',
      credits: 4,
      timezone: 'CST',
      weeklySchedule: [
        {
          day: 'MONDAYS',
          isActive: true,
          timeSlots: [
            {
              startTime: '18:00',
              endTime: '19:30',
              sessions: 10,
              sessionDuration: 90,
              bufferTime: 15
            }
          ]
        },
        {
          day: 'WEDNESDAYS',
          isActive: true,
          timeSlots: [
            {
              startTime: '18:00',
              endTime: '19:30',
              sessions: 10,
              sessionDuration: 90,
              bufferTime: 15
            }
          ]
        }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
      introVideo: 'https://example.com/coding-intro.mp4',
      coach: {
        id: 'c3',
        name: 'David Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    }
  ],
  enrollments: [
    {
      id: 'e1',
      courseId: '1',
      courseTitle: 'Advanced Mathematics for Grade 8',
      childName: 'Emma Johnson',
      childId: 'ch1',
      enrollmentDate: '2024-01-10',
      status: 'active',
      progress: 75,
      nextSession: '2024-01-15 16:00',
      coachName: 'Sarah Johnson',
      totalSessions: 24,
      completedSessions: 18,
      grade: 'Grade 8',
      feedback: 'Excellent progress in algebra concepts'
    },
    {
      id: 'e2',
      courseId: '2',
      courseTitle: 'Creative Writing Workshop',
      childName: 'Alex Chen',
      childId: 'ch2',
      enrollmentDate: '2024-01-12',
      status: 'active',
      progress: 60,
      nextSession: '2024-01-16 09:00',
      coachName: 'Emily Chen',
      totalSessions: 16,
      completedSessions: 10,
      grade: 'Grade 6',
      feedback: 'Great creativity and storytelling skills'
    }
  ],
  upcomingSessions: [
    {
      id: 's1',
      courseId: '1',
      courseTitle: 'Advanced Mathematics for Grade 8',
      childName: 'Emma Johnson',
      date: '2024-01-15',
      time: '16:00',
      duration: '90 minutes',
      status: 'upcoming',
      coachName: 'Sarah Johnson',
      topic: 'Linear Equations and Inequalities',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 's2',
      courseId: '2',
      courseTitle: 'Creative Writing Workshop',
      childName: 'Alex Chen',
      date: '2024-01-16',
      time: '09:00',
      duration: '90 minutes',
      status: 'upcoming',
      coachName: 'Ms. Emily Chen',
      topic: 'Character Development Workshop',
      meetingLink: 'https://meet.google.com/xyz-uvw-rst'
    }
  ],
  schedule: [
    {
      id: 's1',
      courseId: '1',
      courseTitle: 'Advanced Mathematics for Grade 8',
      childName: 'Emma Johnson',
      date: '2024-01-15',
      time: '16:00',
      duration: '90 minutes',
      status: 'upcoming',
      coachName: 'Sarah Johnson',
      topic: 'Linear Equations and Inequalities',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: 's2',
      courseId: '2',
      courseTitle: 'Creative Writing Workshop',
      childName: 'Alex Chen',
      date: '2024-01-16',
      time: '09:00',
      duration: '90 minutes',
      status: 'upcoming',
      coachName: 'Emily Chen',
      topic: 'Character Development Workshop',
      meetingLink: 'https://meet.google.com/xyz-uvw-rst'
    },
    {
      id: 's3',
      courseId: '1',
      courseTitle: 'Advanced Mathematics for Grade 8',
      childName: 'Emma Johnson',
      date: '2024-01-17',
      time: '16:00',
      duration: '90 minutes',
      status: 'upcoming',
      coachName: 'Sarah Johnson',
      topic: 'Geometry Fundamentals',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    }
  ]
}; 