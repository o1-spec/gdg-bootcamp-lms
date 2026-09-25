export type ResourceType =
  | 'pdf'
  | 'notes'
  | 'slides'
  | 'video'
  | 'link'
  | 'github'
  | 'code'
  | 'article'
  | 'figma'
  | 'dataset'
  | 'exercise'
  | 'cheatsheet';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  trackId: string;
  trackName: string;
  moduleName?: string;
  lessonName?: string;
  url: string;
  fileSize?: string;
  duration?: string;
  addedAt: string;
  description?: string;
}

export type TrackCategory =
  | 'Frontend Development'
  | 'Backend Development'
  | 'Mobile Development'
  | 'UI/UX Design'
  | 'Data Science / AI'
  | 'Cybersecurity'
  | 'Cloud / DevOps'
  | 'DSA / Interview Preparation';

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  order: number;
}

export interface Track {
  id: string;
  name: TrackCategory;
  slug: string;
  description: string;
  cohort: string;
  instructors: {
    name: string;
    avatar: string;
    title: string;
  }[];
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  currentModule: string;
  nextLesson: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  colorTheme: {
    badge: string;
    border: string;
    accent: string;
  };
}

export type AssignmentStatus = 'pending' | 'due_soon' | 'submitted' | 'graded';

export interface Assignment {
  id: string;
  title: string;
  trackId: string;
  trackName: TrackCategory;
  dueDate: string;
  dueTime: string;
  daysRemaining: number;
  points: number;
  status: AssignmentStatus;
  submissionCount?: number;
  totalStudents?: number;
  grade?: number;
}

export interface UpcomingClass {
  id: string;
  title: string;
  trackName: TrackCategory;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  dateTime: string;
  duration: string;
  isLiveNow?: boolean;
  meetUrl: string;
  attendeesCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  trackName?: TrackCategory | 'All Cohort';
  content: string;
  isPinned?: boolean;
  category: 'Event' | 'Curriculum' | 'Reminder' | 'Community';
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  cohort: string;
  role: 'Student' | 'Mentor/Tutor' | 'Admin';
  enrolledTracksCount: number;
  studyStreakDays: number;
  totalHoursSpent: number;
}

export interface DashboardStats {
  enrolledTracks: number;
  completedLessons: number;
  totalLessons: number;
  pendingAssignments: number;
  overallProgressPercentage: number;
  attendanceRate: number;
}
