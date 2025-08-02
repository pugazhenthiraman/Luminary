# Parent Dashboard

A comprehensive dashboard for parents to manage their children's learning journey on the Luminary platform.

## Features

### 🔐 Authentication

- **Parent Registration/Login**: No approval required - parents can register and login immediately
- **Email-based Authentication**: Use registered email for login
- **Session Management**: Secure authentication with localStorage

### 📊 Overview Dashboard

- **Real-time Metrics**: Active enrollments, average progress, upcoming sessions, children count
- **Progress Tracking**: Visual progress bars and completion statistics
- **Quick Actions**: Easy navigation to key features
- **Recent Activity**: Latest enrollments and upcoming sessions

### 📚 Course Management

- **Verified Courses Only**: Browse only admin-approved courses
- **Advanced Filtering**: Filter by category, level, price range
- **Search Functionality**: Search courses, coaches, or topics
- **Sorting Options**: Sort by rating, price, popularity, start date
- **Detailed Course Views**: Comprehensive course information with:
  - Course description and requirements
  - Coach information and ratings
  - Schedule and pricing
  - Topics covered
  - Enrollment status

### 🎓 Enrollment Tracking

- **Active Enrollments**: View all current course enrollments
- **Progress Monitoring**: Track completion percentage and grades
- **Session Management**: View completed and upcoming sessions
- **Coach Communication**: Direct contact with course coaches
- **Certificate Download**: Access completion certificates

### 📅 Schedule Management

- **Upcoming Sessions**: View all scheduled learning sessions
- **Session Details**: Date, time, duration, topic, and meeting links
- **Join Sessions**: Direct access to live sessions
- **Preparation Tips**: Guidelines for session preparation
- **Filtering**: Filter by child and date

### 👤 Profile Management

- **Personal Information**: Edit name, email, phone, address
- **Children Management**: Add, edit, and remove children profiles
- **Account Settings**: Password, notifications, privacy settings
- **Account Status**: Verification status and account health

## Components Structure

```
src/Parent/
├── ParentDashboard.tsx          # Main dashboard component
├── components/
│   ├── Header.tsx              # Navigation header with user menu
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Overview.tsx            # Dashboard overview with metrics
│   ├── Courses.tsx             # Course browsing and enrollment
│   ├── Enrollments.tsx         # Enrollment tracking and management
│   ├── Schedule.tsx            # Session scheduling and management
│   └── Profile.tsx             # Profile and account settings
└── data/
    └── mockData.ts             # Mock data for development
```

## Key Features

### 🔍 Advanced Search & Filtering

- **Text Search**: Search across course titles, descriptions, and coach names
- **Category Filter**: Filter by subject categories (Math, Science, etc.)
- **Level Filter**: Filter by difficulty level (Beginner, Intermediate, Advanced)
- **Price Range**: Filter by cost ranges
- **Sorting**: Multiple sorting options for better course discovery

### 📱 Responsive Design

- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Easy navigation on mobile devices
- **Collapsible Sidebar**: Space-efficient navigation
- **Modal Dialogs**: Detailed views without page navigation

### 🎨 Modern UI/UX

- **Clean Design**: Modern, professional interface
- **Color-Coded Status**: Visual indicators for different states
- **Progress Visualization**: Clear progress bars and metrics
- **Interactive Elements**: Hover effects and smooth transitions

### 🔒 Security & Privacy

- **Verified Courses Only**: Only admin-approved courses are shown
- **Secure Authentication**: Proper session management
- **Data Protection**: Secure handling of personal information

## Usage

### For Parents

1. **Register/Login**: Create account or login with email
2. **Browse Courses**: Use filters and search to find suitable courses
3. **Enroll Children**: Select courses and enroll children
4. **Track Progress**: Monitor learning progress and grades
5. **Manage Schedule**: View and join upcoming sessions
6. **Update Profile**: Manage personal and children information

### For Developers

1. **Component Integration**: Import and use components as needed
2. **Data Integration**: Replace mock data with real API calls
3. **Customization**: Modify styling and functionality as required
4. **Extension**: Add new features and components

## Technical Stack

- **React**: Frontend framework
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library for consistent UI
- **React Router**: Navigation and routing

## Future Enhancements

- **Payment Integration**: Secure payment processing
- **Real-time Notifications**: Live updates and alerts
- **Video Conferencing**: Integrated session joining
- **Progress Reports**: Detailed learning analytics
- **Parent-Coach Communication**: Built-in messaging system
- **Mobile App**: Native mobile application

## Getting Started

1. Ensure all dependencies are installed
2. Import the ParentDashboard component
3. Set up routing for parent-specific routes
4. Configure authentication and data sources
5. Customize styling and branding as needed

The Parent Dashboard provides a comprehensive solution for parents to manage their children's educational journey with ease and efficiency.
