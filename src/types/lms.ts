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
  | 'document'
  | 'cheatsheet'
  | 'practice'
  | 'exercise'
  | 'other';

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

export interface LibraryResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  trackId: string;
  trackName: string;
  moduleName: string;
  url: string;
  publicId?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: string;
  duration?: string;
  uploadedBy: string;
  addedAt: string;
  isRequired: boolean;
  accentColor: string;
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

export type LessonStatus = 'completed' | 'current' | 'locked';

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  order: number;
}

export interface DetailedLesson {
  id: string;
  title: string;
  durationMinutes: number;
  status: LessonStatus;
  order: number;
  type?: 'lecture' | 'exercise' | 'project' | 'quiz';
}

export interface LessonResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  isRequired: boolean;
  fileSize?: string;
  duration?: string;
  description?: string;
}

export interface LessonContentSection {
  title: string;
  content: string;
  bulletPoints?: string[];
  codeSnippet?: {
    language: string;
    code: string;
  };
  callout?: {
    type: 'note' | 'tip' | 'warning' | 'google';
    text: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface FullLesson {
  id: string;
  slug: string;
  title: string;
  trackId: string;
  trackName: string;
  trackAccentColor: string;
  moduleId: string;
  moduleName: string;
  moduleOrder: number;
  durationMinutes: number;
  type: 'Lesson' | 'Exercise' | 'Workshop' | 'Project';
  status: LessonStatus;
  description: string;
  learningObjectives: string[];
  video?: {
    title: string;
    duration: string;
    url: string;
    thumbnail?: string;
  };
  sections: LessonContentSection[];
  resources: LessonResourceItem[];
  prevLesson?: {
    id: string;
    slug: string;
    title: string;
  };
  nextLesson?: {
    id: string;
    slug: string;
    title: string;
  };
}

export interface Module {
  id: string;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  order: number;
}

export interface DetailedModule {
  id: string;
  order: number;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  status: 'completed' | 'in_progress' | 'upcoming';
  lessons: DetailedLesson[];
}

export interface DetailedResource {
  id: string;
  title: string;
  type: ResourceType;
  moduleTitle: string;
  url: string;
  isRequired: boolean;
  fileSize?: string;
  duration?: string;
  description?: string;
}

export interface DetailedAssignment {
  id: string;
  title: string;
  moduleTitle: string;
  dueDate: string;
  status: 'in_progress' | 'not_started' | 'submitted';
  points: number;
  description?: string;
}

export interface DetailedTrackProgress {
  overallPercentage: number;
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  completedAssignments: number;
  totalAssignments: number;
  attendanceRate: number;
  moduleProgress: {
    moduleOrder: number;
    moduleTitle: string;
    percentage: number;
  }[];
}

export interface DetailedTrack {
  id: string;
  slug: string;
  name: TrackCategory;
  shortDescription: string;
  fullDescription: string;
  accentColor: string; // e.g. #4285F4 (blue), #34A853 (green), #EA4335 (red), #FBBC04 (yellow)
  cohort: string;
  duration: string;
  mentor: {
    name: string;
    role: string;
    avatar: string;
  };
  currentModule: string;
  nextClass: string;
  progress: DetailedTrackProgress;
  modules: DetailedModule[];
  resources: DetailedResource[];
  assignments: DetailedAssignment[];
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

export type ExtendedAssignmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'reviewed'
  | 'completed'
  | 'overdue';

export type AssignmentType = 'Project' | 'Exercise' | 'Practice' | 'Challenge';

export type SubmissionStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

export interface AssignmentSubmission {
  status: SubmissionStatus;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
  fileUrl?: string;
  filePublicId?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt?: string;
  score?: number;
  maxScore?: number;
  mentorFeedback?: string;
  mentorName?: string;
}

export interface FullAssignment {
  id: string;
  title: string;
  trackId: string;
  trackName: TrackCategory;
  trackAccentColor: string;
  moduleName: string;
  type: AssignmentType;
  status: ExtendedAssignmentStatus;
  dueDate: string;
  dueTime?: string;
  daysRemaining: number;
  points: number;
  shortDescription: string;
  fullDescription: string;
  objectives: string[];
  expectedOutcome: string;
  requirements: string[];
  submissionInstructions: string[];
  resources: {
    title: string;
    type: ResourceType;
    url: string;
  }[];
  submission: AssignmentSubmission;
}

export type SessionMode = 'Virtual' | 'In-Person' | 'Hybrid';

export interface BootcampSession {
  id: string;
  title: string;
  trackId: string;
  trackName: TrackCategory;
  trackAccentColor: string;
  topic: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date: string;
  timeRange: string;
  mentor: {
    name: string;
    role: string;
    avatar?: string;
  };
  mode: SessionMode;
  venueOrLink: string;
  meetUrl?: string;
  isLiveNow?: boolean;
  isPast?: boolean;
  recordingUrl?: string;
  topicsCovered: string[];
  attachedResources: {
    title: string;
    type: ResourceType;
    url: string;
  }[];
}

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
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email: string;
  avatar: string;
  cohort: string;
  role: 'Student' | 'Mentor/Tutor' | 'Admin';
  enrolledTracksCount: number;
  studyStreakDays: number;
  totalHoursSpent: number;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  onboardingCompleted?: boolean;
}

export interface BootcampInvite {
  id: string;
  code: string;
  bootcampId: string;
  bootcampName?: string;
  cohortId?: string | null;
  cohortName?: string | null;
  trackId?: string | null;
  trackName?: string | null;
  allowTrackSelection: boolean;
  maxTrackSelections?: number | null;
  createdById: string;
  creatorName?: string;
  expiresAt?: string | null;
  maxUses?: number | null;
  useCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface InviteValidationResult {
  valid: boolean;
  error?: string;
  invite?: {
    code: string;
    bootcampId: string;
    bootcampName: string;
    cohortId?: string | null;
    cohortName?: string | null;
    trackId?: string | null;
    trackName?: string | null;
    trackSlug?: string | null;
    allowTrackSelection: boolean;
    maxTrackSelections?: number | null;
    availableTracks?: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      accent?: string | null;
    }[];
  };
}

export interface DashboardStats {
  enrolledTracks: number;
  completedLessons: number;
  totalLessons: number;
  pendingAssignments: number;
  overallProgressPercentage: number;
  attendanceRate: number;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  date: string;
  trackId: string;
  trackName: TrackCategory;
  trackAccentColor: string;
  sessionTitle: string;
  mentorName: string;
  status: AttendanceStatus;
  durationMinutes?: number;
  note?: string;
}

export interface AttendanceSummaryData {
  attendanceRate: number;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
}

// Announcements Types
export type AnnouncementPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'REMINDER';

export interface FullAnnouncement {
  id: string;
  title: string;
  content: string;
  trackId?: string;
  trackName: string;
  trackAccentColor?: string;
  postedDate: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  priority: AnnouncementPriority;
  attachments?: {
    title: string;
    type: ResourceType;
    url: string;
  }[];
  isPinned?: boolean;
}

// Progress Types
export interface ModuleProgressItem {
  id: string;
  moduleOrder: number;
  title: string;
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface TrackProgressSummary {
  trackId: string;
  trackName: TrackCategory;
  trackAccentColor: string;
  overallPercentage: number;
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  completedAssignments: number;
  totalAssignments: number;
  nextLessonHref: string;
  modules: ModuleProgressItem[];
}

export interface OverallBootcampProgress {
  overallPercentage: number;
  tracksEnrolled: number;
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  completedAssignments: number;
  totalAssignments: number;
  attendanceRate: number;
  weeklyActivity: {
    lessonsCompletedThisWeek: number;
    assignmentsSubmittedThisWeek: number;
    sessionsAttendedThisWeek: number;
    hoursSpentThisWeek: number;
  };
  trackSummaries: TrackProgressSummary[];
  attendanceSummary: AttendanceSummaryData;
}
