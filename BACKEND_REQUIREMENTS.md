# Backend Requirements for Enhanced Student Dashboard

This document outlines the backend endpoints and features that need to be implemented to fully support the enhanced student dashboard UI.

## Overview

The student dashboard has been redesigned to provide a comprehensive view of student progress, upcoming quizzes, notifications, and learning analytics. Some features are currently using mock data or placeholders and require backend implementation.

---

## 1. Student Dashboard Statistics Endpoint

### Endpoint: `GET /api/v1/students/dashboard/stats`

**Purpose**: Fetch comprehensive statistics for the student dashboard.

**Response Format**:
```json
{
  "completed_attempts": 42,
  "learning_hours": 156.5,
  "average_score": 78.5,
  "progress_percentage": 65,
  "total_quizzes": 50,
  "completed_quizzes": 32,
  "total_groups": 5,
  "active_quizzes": 8,
  "in_progress_attempts": 2
}
```

**Implementation Notes**:
- Calculate `completed_attempts` by counting all `SessionAttempt` records with `status = 'submitted'` for the current user
- Calculate `learning_hours` by summing `total_time_seconds` from all completed attempts and converting to hours
- Calculate `average_score` by averaging the `score` field from all completed attempts
- Calculate `progress_percentage` as `(completed_quizzes / total_quizzes) * 100`
- `completed_quizzes` = quizzes where user has at least one submitted attempt
- `in_progress_attempts` = attempts with `status = 'in_progress'`

**Database Queries Needed**:
```sql
-- Completed attempts count
SELECT COUNT(*) FROM quiz_attempts 
WHERE user_id = ? AND status = 'submitted'

-- Learning hours (sum of total_time_seconds)
SELECT SUM(total_time_seconds) / 3600.0 FROM quiz_attempts 
WHERE user_id = ? AND status = 'submitted'

-- Average score
SELECT AVG(score) FROM quiz_attempts 
WHERE user_id = ? AND status = 'submitted' AND score IS NOT NULL

-- Completed quizzes count
SELECT COUNT(DISTINCT quiz_id) FROM quiz_attempts 
WHERE user_id = ? AND status = 'submitted'

-- In-progress attempts
SELECT COUNT(*) FROM quiz_attempts 
WHERE user_id = ? AND status = 'in_progress'
```

---

## 2. Student Learning Hours Tracking

### Endpoint: `GET /api/v1/students/learning-hours`

**Purpose**: Get detailed learning hours breakdown (daily, weekly, monthly).

**Query Parameters**:
- `period`: `daily` | `weekly` | `monthly` (default: `monthly`)
- `days`: Number of days to include (for daily/weekly)

**Response Format**:
```json
{
  "total_hours": 156.5,
  "period": "monthly",
  "breakdown": [
    {
      "date": "2025-03-01",
      "hours": 4.5,
      "attempts_count": 3
    },
    {
      "date": "2025-03-02",
      "hours": 6.0,
      "attempts_count": 5
    }
  ],
  "trend": "increasing" // increasing | decreasing | stable
}
```

**Implementation Notes**:
- Sum `total_time_seconds` from `quiz_attempts` grouped by date
- Convert seconds to hours
- Calculate trend by comparing current period to previous period

---

## 3. Student Quiz Progress Tracking

### Endpoint: `GET /api/v1/students/quizzes/progress`

**Purpose**: Get detailed progress for each quiz the student has access to.

**Response Format**:
```json
{
  "quizzes": [
    {
      "quiz_id": "uuid",
      "quiz_title": "Behavioral Economics",
      "total_questions": 50,
      "attempts_count": 3,
      "best_score": 85.5,
      "average_score": 78.0,
      "last_attempt_at": "2025-03-10T14:30:00Z",
      "status": "completed", // completed | in_progress | not_started
      "progress_percentage": 100,
      "time_spent_hours": 2.5
    }
  ],
  "summary": {
    "total_quizzes": 50,
    "completed": 32,
    "in_progress": 2,
    "not_started": 16
  }
}
```

**Implementation Notes**:
- For each quiz, check if user has attempts
- Calculate best score, average score from attempts
- Determine status: `completed` if has submitted attempt, `in_progress` if has in-progress attempt, `not_started` otherwise
- Calculate progress percentage based on questions answered vs total questions

---

## 4. Upcoming Quizzes with Time-based Filtering

### Endpoint: `GET /api/v1/quizzes/upcoming`

**Purpose**: Get quizzes that are upcoming, ongoing, or scheduled for today.

**Query Parameters**:
- `filter`: `today` | `this_week` | `this_month` | `all`
- `status`: `upcoming` | `ongoing` | `scheduled`

**Response Format**:
```json
{
  "quizzes": [
    {
      "quiz_id": "uuid",
      "title": "Behavioral Economics",
      "start_time": "2025-03-12T09:00:00Z",
      "end_time": "2025-03-12T10:20:00Z",
      "time_limit_minutes": 80,
      "group_name": "Economics 101",
      "status": "ongoing", // upcoming | ongoing | scheduled
      "can_start": true,
      "time_until_start": null, // null if ongoing
      "time_remaining": 3600 // seconds remaining if ongoing
    }
  ]
}
```

**Implementation Notes**:
- Filter quizzes based on `start_time` and `end_time` relative to current time
- `ongoing`: `start_time <= now < end_time`
- `upcoming`: `start_time > now`
- `scheduled`: `start_time` is set but in future
- Calculate time remaining for ongoing quizzes

---

## 5. Notifications System

### Endpoint: `GET /api/v1/notifications`

**Purpose**: Get user notifications (quiz announcements, system updates, etc.).

**Query Parameters**:
- `limit`: Number of notifications (default: 10)
- `unread_only`: Boolean (default: false)

**Response Format**:
```json
{
  "notifications": [
    {
      "notification_id": "uuid",
      "type": "quiz_announcement", // quiz_announcement | system_update | group_invite | achievement
      "title": "New Quiz Available",
      "message": "Behavioral Economics quiz is now available",
      "created_at": "2025-03-10T10:00:00Z",
      "read": false,
      "action_url": "/exams/quiz-id",
      "icon": "Q" // Optional icon identifier
    }
  ],
  "unread_count": 5
}
```

### Endpoint: `POST /api/v1/notifications/{notification_id}/read`

**Purpose**: Mark a notification as read.

### Endpoint: `POST /api/v1/notifications/read-all`

**Purpose**: Mark all notifications as read.

**Implementation Notes**:
- Create a `notifications` table with fields: `notification_id`, `user_id`, `type`, `title`, `message`, `created_at`, `read`, `action_url`
- Trigger notifications when:
  - New quiz is published to a group the user belongs to
  - Quiz deadline is approaching
  - System maintenance is scheduled
  - User achieves a milestone (e.g., completes 10 quizzes)

---

## 6. Calendar Events Endpoint

### Endpoint: `GET /api/v1/students/calendar/events`

**Purpose**: Get calendar events (quiz schedules, deadlines) for a given month.

**Query Parameters**:
- `year`: Year (default: current year)
- `month`: Month 1-12 (default: current month)

**Response Format**:
```json
{
  "year": 2025,
  "month": 3,
  "events": [
    {
      "date": "2025-03-12",
      "events": [
        {
          "quiz_id": "uuid",
          "quiz_title": "Behavioral Economics",
          "start_time": "2025-03-12T09:00:00Z",
          "end_time": "2025-03-12T10:20:00Z",
          "type": "quiz_start", // quiz_start | quiz_end | quiz_deadline
          "color": "blue" // For calendar display
        }
      ]
    }
  ]
}
```

**Implementation Notes**:
- Extract quiz `start_time` and `end_time` from quizzes the user has access to
- Group events by date
- Include quiz deadlines if applicable

---

## 7. Student Activity Feed

### Endpoint: `GET /api/v1/students/activity`

**Purpose**: Get recent activity feed (quiz completions, achievements, etc.).

**Query Parameters**:
- `limit`: Number of activities (default: 10)
- `type`: Filter by activity type (optional)

**Response Format**:
```json
{
  "activities": [
    {
      "activity_id": "uuid",
      "type": "quiz_completed", // quiz_completed | quiz_started | achievement_unlocked | score_improved
      "title": "Completed Behavioral Economics",
      "description": "Scored 85% on your latest attempt",
      "created_at": "2025-03-10T14:30:00Z",
      "quiz_id": "uuid",
      "quiz_title": "Behavioral Economics",
      "score": 85.0,
      "icon": "trophy"
    }
  ]
}
```

**Implementation Notes**:
- Track activities when:
  - User completes a quiz
  - User starts a quiz
  - User achieves a new best score
  - User unlocks an achievement
- Store in `student_activities` table or generate on-the-fly from `quiz_attempts`

---

## 8. Recommended Quizzes

### Endpoint: `GET /api/v1/students/quizzes/recommended`

**Purpose**: Get personalized quiz recommendations based on student's progress and performance.

**Query Parameters**:
- `limit`: Number of recommendations (default: 6)

**Response Format**:
```json
{
  "recommendations": [
    {
      "quiz_id": "uuid",
      "title": "Advanced Economics",
      "reason": "Based on your performance in Behavioral Economics", // Why it's recommended
      "difficulty": "intermediate",
      "estimated_time_minutes": 60,
      "topics": ["Economics", "Behavioral Science"]
    }
  ]
}
```

**Implementation Notes**:
- Recommend quizzes based on:
  - Topics user has performed well in (suggest advanced topics)
  - Topics user has struggled with (suggest practice quizzes)
  - Quizzes from groups user belongs to
  - Popular quizzes in user's groups
- Use machine learning or rule-based algorithm

---

## 9. Quiz Completion Status

### Endpoint: `GET /api/v1/students/quizzes/completion-status`

**Purpose**: Get completion status for quizzes (for progress tracking).

**Response Format**:
```json
{
  "quizzes": [
    {
      "quiz_id": "uuid",
      "quiz_title": "Behavioral Economics",
      "status": "completed", // completed | in_progress | not_started
      "attempts_count": 3,
      "best_score": 85.0,
      "last_attempt_at": "2025-03-10T14:30:00Z",
      "completion_date": "2025-03-10T14:30:00Z" // First completion date
    }
  ],
  "overall_progress": 65.0 // Percentage
}
```

**Implementation Notes**:
- Check `quiz_attempts` table for each quiz
- Determine status based on attempt statuses
- Calculate overall progress as percentage of completed quizzes

---

## 10. Performance Trends

### Endpoint: `GET /api/v1/performance/trends`

**Purpose**: Get performance trends over time (already partially implemented, needs enhancement).

**Query Parameters**:
- `days`: Number of days (default: 30)
- `metric`: `score` | `attempts` | `time_spent` (default: `score`)

**Response Format**:
```json
{
  "trends": [
    {
      "date": "2025-03-01",
      "average_score": 75.0,
      "attempts_count": 3,
      "time_spent_hours": 4.5
    }
  ],
  "summary": {
    "trend_direction": "increasing", // increasing | decreasing | stable
    "percentage_change": 5.2 // Percentage change from previous period
  }
}
```

**Implementation Notes**:
- Aggregate `quiz_attempts` data by date
- Calculate trends and percentage changes
- This endpoint already exists but may need enhancement

---

## Database Schema Additions

### Notifications Table
```sql
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- quiz_announcement, system_update, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    icon VARCHAR(10), -- Optional icon identifier
    INDEX idx_user_notifications (user_id, created_at DESC),
    INDEX idx_unread (user_id, read)
);
```

### Student Activities Table (Optional)
```sql
CREATE TABLE student_activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quiz_id UUID,
    score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_activities (user_id, created_at DESC)
);
```

---

## Implementation Priority

### High Priority (Core Dashboard Features)
1. ✅ Student Dashboard Statistics Endpoint
2. ✅ Student Quiz Progress Tracking
3. ✅ Upcoming Quizzes with Time-based Filtering
4. ✅ Calendar Events Endpoint

### Medium Priority (Enhanced Features)
5. ✅ Notifications System
6. ✅ Student Learning Hours Tracking
7. ✅ Quiz Completion Status

### Low Priority (Nice-to-Have)
8. ✅ Student Activity Feed
9. ✅ Recommended Quizzes
10. ✅ Performance Trends Enhancement

---

## Notes

- All endpoints should require authentication (JWT token)
- Use existing `quiz_attempts` table for most calculations
- Consider caching dashboard statistics for performance
- Notifications can be generated on-the-fly or stored in a table
- Calendar events can be generated from quiz `start_time` and `end_time`
- Recommended quizzes can use simple rule-based logic initially, ML later

---

## Testing Checklist

- [ ] Dashboard stats endpoint returns accurate counts
- [ ] Learning hours calculation is correct (seconds to hours conversion)
- [ ] Average score calculation excludes null/invalid scores
- [ ] Progress percentage is calculated correctly
- [ ] Upcoming quizzes are filtered correctly by time
- [ ] Calendar events are grouped by date correctly
- [ ] Notifications are created when quizzes are published
- [ ] Notifications can be marked as read
- [ ] Activity feed shows recent activities in correct order
- [ ] Recommended quizzes are relevant to user's progress

---

## Future Enhancements

1. **Achievements System**: Track and display student achievements (e.g., "Completed 10 quizzes", "Scored 100%", "Studied 100 hours")
2. **Study Streaks**: Track consecutive days of quiz activity
3. **Peer Comparison**: Compare student's performance with group averages
4. **Personalized Learning Path**: Suggest a sequence of quizzes based on prerequisites
5. **Time-based Analytics**: Show best study times, productivity patterns
6. **Goal Setting**: Allow students to set learning goals and track progress

---

**Last Updated**: March 2025
**Author**: Development Team

