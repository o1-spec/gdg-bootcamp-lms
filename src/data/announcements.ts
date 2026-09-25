import { FullAnnouncement } from '@/types/lms';

export const mockAnnouncementsList: FullAnnouncement[] = [
  {
    id: 'anc-1',
    title: 'DSA Session Rescheduled',
    content:
      'Today\'s DSA session on Sliding Window algorithms has been moved to tomorrow at 5:00 PM due to a mentor device issue. The Google Meet link remains unchanged. Please review the pre-class notes in the meantime.',
    trackId: 'dsa-interview-prep',
    trackName: 'DSA / Interview Preparation',
    trackAccentColor: '#EA4335',
    postedDate: 'Today at 10:30 AM',
    author: {
      name: 'Nureni Jamiu',
      role: 'DSA Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    },
    priority: 'IMPORTANT',
    isPinned: true,
    attachments: [
      {
        title: 'Sliding Window Mastery Guide',
        type: 'article',
        url: '#',
      },
    ],
  },
  {
    id: 'anc-2',
    title: 'Backend Assignment Deadline Reminder',
    content:
      'The "Build a REST API" project milestone is due on September 30 at 11:59 PM. Please verify that your public GitHub repository includes comprehensive README documentation with example curl commands and valid status codes.',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    postedDate: 'Yesterday at 3:15 PM',
    author: {
      name: 'Oluwafemi Onadokun',
      role: 'Backend Lead',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    },
    priority: 'REMINDER',
    attachments: [
      {
        title: 'Build a REST API Assignment',
        type: 'practice',
        url: '/assignments/build-a-rest-api',
      },
    ],
  },
  {
    id: 'anc-3',
    title: 'New PostgreSQL & Database Design Resources Added',
    content:
      'New PostgreSQL and database normalization resources have been uploaded to the Resource Library. This includes the B-Tree Indexing cheat sheet, EXPLAIN ANALYZE performance notes, and schema modeling templates.',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    postedDate: '2 days ago',
    author: {
      name: 'Sarah Chen',
      role: 'Senior Mentor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    },
    priority: 'NORMAL',
    attachments: [
      {
        title: 'PostgreSQL Indexing & Optimization Cheat Sheet',
        type: 'pdf',
        url: '/resources',
      },
    ],
  },
  {
    id: 'anc-4',
    title: 'Bootcamp General Update: Session Links & Attendance Verification',
    content:
      'Please remember to use the same recurring Google Meet link for all weekly workshops. Attendance is automatically marked based on entry timestamps. If you encounter any connectivity issues, contact your squad mentor immediately.',
    trackId: 'all',
    trackName: 'All Tracks',
    postedDate: '4 days ago',
    author: {
      name: 'GDG LASU Lead Team',
      role: 'Organizers',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    },
    priority: 'NORMAL',
  },
  {
    id: 'anc-5',
    title: 'Cross-Track Capstone Squad Formation Kickoff',
    content:
      'Cross-track capstone squads will be announced next Monday! Each squad of 3 will unite Backend, Frontend, and DSA engineers to build and deploy an open-source product. Mentors will conduct weekly code reviews and architecture check-ins.',
    trackId: 'all',
    trackName: 'All Tracks',
    postedDate: '5 days ago',
    author: {
      name: 'Samuel Alawode',
      role: 'Cohort Coordinator',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    },
    priority: 'IMPORTANT',
  },
  {
    id: 'anc-6',
    title: 'Action Required: Mid-Cohort Technical Survey',
    content:
      'Please take 3 minutes to complete the anonymous mid-cohort technical survey. Your feedback helps us fine-tune lecture depth, pacing, and provide tailored mentor support for upcoming project sprints.',
    trackId: 'all',
    trackName: 'All Tracks',
    postedDate: '1 week ago',
    author: {
      name: 'GDG LASU Core Team',
      role: 'Organizers',
    },
    priority: 'URGENT',
  },
];

export function getAnnouncementById(id: string): FullAnnouncement | undefined {
  return mockAnnouncementsList.find((a) => a.id === id);
}
