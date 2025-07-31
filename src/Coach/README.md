# Coach Dashboard

A modern, professional coach dashboard built with React, TypeScript, and Tailwind CSS. This dashboard provides coaches with comprehensive tools to manage their courses, videos, schedule, analytics, and profile.

## Architecture

The coach dashboard is organized into modular components for better maintainability and scalability:

```
src/Coach/
├── CoachDashboard.tsx          # Main dashboard container
├── components/                 # Modular dashboard sections
│   ├── Header.tsx             # Dashboard header with navigation and user info
│   ├── Sidebar.tsx            # Collapsible sidebar navigation
│   ├── Overview.tsx           # Dashboard overview with stats and quick actions
│   ├── Courses.tsx            # Course management
│   ├── Videos.tsx             # Video library management
│   ├── Schedule.tsx           # Schedule and session management
│   ├── Analytics.tsx          # Performance analytics and insights
│   └── Profile.tsx            # Profile management
├── data/
│   └── mockData.ts            # Mock data for demonstration
└── README.md                  # This documentation
```

## Authentication

The coach dashboard uses the **unified authentication system** shared across the entire application:

### Demo Credentials

- **Email**: `pugazhenthi962003@gmail.com`
- **Password**: `@Pugal2003`

### How to Access

1. Navigate to `/coach/login` or `/loginCoach`
2. Use the demo credentials above
3. Upon successful login, you'll be redirected to `/coach/dashboard`

### Authentication Flow

- Uses the shared `useAuth` hook from `src/hooks/useAuth.ts`
- Integrates with the main `Login` component (`src/Login/login.tsx`)
- Stores authentication data in `localStorage` with role-based access
- Automatically redirects to login if not authenticated

## Dashboard Sections

### 1. Overview

- **Key Metrics**: Total students, courses, earnings, and rating
- **Quick Actions**: Create course, upload video, schedule session
- **Recent Activity**: Latest actions and updates
- **Upcoming Sessions**: Next scheduled classes

### 2. Courses

- **Course Management**: View, edit, and create courses
- **Course Analytics**: Student enrollment, ratings, progress
- **Course Status**: Active, draft, and archived courses

### 3. Videos

- **Video Library**: Upload and manage educational videos
- **Video Analytics**: Views, engagement metrics
- **Video Organization**: Categorize and tag videos

### 4. Schedule

- **Session Management**: View and manage upcoming sessions
- **Calendar Integration**: Visual schedule representation
- **Session Types**: One-on-one and group sessions

### 5. Analytics

- **Performance Metrics**: Earnings, student growth, course views
- **Charts and Graphs**: Visual data representation
- **Trends Analysis**: Monthly and yearly performance trends

### 6. Profile

- **Personal Information**: Name, email, experience, specialization
- **Profile Picture**: Avatar management
- **Bio Management**: Professional description and expertise
- **Settings**: Account preferences and notifications

## Design Features

### Modern UI/UX

- **Clean Interface**: Minimalist design with focus on functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Professional Color Scheme**: Blue and indigo gradients with white backgrounds
- **Smooth Animations**: Hover effects and transitions for better user experience

### Navigation

- **Collapsible Sidebar**: Toggle between full and icon-only navigation
- **Header Navigation**: Professional header with notifications and user profile
- **Active State Indicators**: Visual feedback for current section
- **Icon-based Navigation**: Intuitive icons for each section
- **Logout Integration**: Easy access to logout functionality

### Responsive Features

- **Sidebar Toggle**: Collapsible sidebar that shrinks to icons only
- **Header Controls**: Toggle button, notifications, user profile, and logout
- **Mobile Friendly**: Responsive design that works on all screen sizes
- **Smooth Transitions**: CSS animations for sidebar collapse/expand

## Technical Features

### React & TypeScript

- **Type Safety**: Full TypeScript implementation with proper interfaces
- **Component Architecture**: Modular, reusable components
- **State Management**: React hooks for local state management
- **Props Interface**: Well-defined prop interfaces for components

### Tailwind CSS

- **Utility-first Styling**: Consistent design system
- **Responsive Classes**: Mobile-first responsive design
- **Custom Components**: Tailored styling for dashboard elements
- **Gradient Backgrounds**: Modern gradient effects

### Data Management

- **Mock Data**: Comprehensive mock data for demonstration
- **Data Structure**: Well-organized data interfaces
- **Component Integration**: Seamless data flow between components

## Getting Started

### Prerequisites

- Node.js and npm installed
- React development environment set up
- Tailwind CSS configured

### Installation

1. Navigate to the project directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Accessing the Dashboard

1. Open your browser and go to `http://localhost:5173/coach/login`
2. Use the demo credentials:
   - Email: `pugazhenthi962003@gmail.com`
   - Password: `@Pugal2003`
3. Click "Sign In" to access the dashboard

### Testing Different Sections

- Use the sidebar navigation to switch between dashboard sections
- Toggle the sidebar using the hamburger menu in the header
- Each section demonstrates different aspects of the coach dashboard
- All data is mock data for demonstration purposes

## Future Improvements

### Planned Enhancements

- **Real Backend Integration**: Replace mock data with actual API calls
- **Real-time Updates**: WebSocket integration for live data updates
- **Advanced Analytics**: More detailed performance metrics
- **File Upload**: Actual file upload functionality for videos and documents
- **Notifications**: Real-time notification system
- **Mobile App**: React Native version for mobile access

### Scalability Considerations

- **Component Modularity**: Easy to add new dashboard sections
- **Data Layer**: Prepared for backend integration
- **Authentication**: Ready for production authentication system
- **Performance**: Optimized for large datasets

## Contributing

When contributing to the coach dashboard:

1. **Follow the modular structure** - Keep components in their respective folders
2. **Maintain TypeScript interfaces** - Ensure proper type definitions
3. **Use consistent styling** - Follow the established Tailwind CSS patterns
4. **Update documentation** - Keep this README current with changes
5. **Test thoroughly** - Ensure all sections work correctly

## Support

For questions or issues related to the coach dashboard:

- Check the component documentation
- Review the TypeScript interfaces
- Test with the provided demo credentials
- Ensure all dependencies are properly installed
