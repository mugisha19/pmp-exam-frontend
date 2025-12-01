# Role-Specific Dashboard Layouts

## Overview

Created role-based layout wrappers that provide appropriate navigation and access control for different user roles in the PMP Exam Platform.

## Components Created

### 1. Layout Wrappers

#### StudentLayout.jsx

- Wraps DashboardLayout with STUDENT_NAV_ITEMS
- Navigation items:
  - Dashboard
  - Available Exams
  - My Exams
  - Results
  - Leaderboard
  - Study Materials
  - Profile
  - Settings

#### InstructorLayout.jsx

- Wraps DashboardLayout with INSTRUCTOR_NAV_ITEMS
- Navigation items:
  - Dashboard
  - Manage Exams
  - Question Bank
  - Groups
  - Students
  - Results & Analytics
  - Grading
  - Schedule
  - Announcements
  - Profile
  - Settings

#### AdminLayout.jsx

- Wraps DashboardLayout with ADMIN_NAV_ITEMS
- Navigation items:
  - Dashboard
  - User Management
  - Instructors
  - Students
  - Exams
  - Groups
  - Analytics
  - Reports
  - Notifications
  - System Settings

### 2. Route Files

#### student.routes.jsx

- 8 routes for student features
- All routes protected with RoleRoute
- Allowed roles: ["student", "instructor", "admin"]
- Paths: /dashboard, /exams, /my-exams, /results, /leaderboard, /study-materials, /profile, /settings

#### instructor.routes.jsx

- 11 routes for instructor features
- All routes protected with RoleRoute
- Allowed roles: ["instructor", "admin"]
- Paths: /instructor/dashboard, /instructor/exams, /instructor/questions, /instructor/groups, etc.

#### admin.routes.jsx

- 10 routes for admin features
- All routes protected with RoleRoute
- Allowed roles: ["admin"]
- Paths: /admin/dashboard, /admin/users, /admin/instructors, /admin/students, etc.

### 3. Updated Files

#### App.jsx

- Imports all three route files
- Renders student, instructor, and admin routes
- Maintains auth routes and error handling

#### pages/Dashboard.jsx

- Updated to use StudentLayout instead of DashboardLayout
- Serves as the main student dashboard

#### components/layouts/index.js

- Exports all layout components for easy importing

## Usage

### For Student Pages

```jsx
import StudentLayout from "@/components/layouts/StudentLayout";

const MyPage = () => {
  return (
    <StudentLayout title="Page Title" subtitle="Description">
      {/* Your content */}
    </StudentLayout>
  );
};
```

### For Instructor Pages

```jsx
import InstructorLayout from "@/components/layouts/InstructorLayout";

const MyPage = () => {
  return (
    <InstructorLayout title="Page Title" subtitle="Description">
      {/* Your content */}
    </InstructorLayout>
  );
};
```

### For Admin Pages

```jsx
import AdminLayout from "@/components/layouts/AdminLayout";

const MyPage = () => {
  return (
    <AdminLayout title="Page Title" subtitle="Description">
      {/* Your content */}
    </AdminLayout>
  );
};
```

## Features

- **Role-Based Navigation**: Each layout shows appropriate menu items for the user's role
- **Access Control**: RoleRoute component ensures users can only access routes they're authorized for
- **Responsive Design**: All layouts work on mobile and desktop with appropriate sidebars
- **Dark Theme**: Consistent dark theme across all layouts
- **Placeholder Pages**: All routes have placeholder components ready to be replaced with actual implementations

## Next Steps

Replace the placeholder components in route files with actual page implementations:

- Create real page components in src/pages/
- Import and use them in the respective route files
- Implement business logic and API integrations
