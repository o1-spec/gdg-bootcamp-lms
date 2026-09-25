import { Metadata } from 'next';
import { AssignmentsClient } from '@/components/assignments/AssignmentsClient';

export const metadata: Metadata = {
  title: 'Assignments & Milestones | Bootcamp LMS — GDG on Campus LASU',
  description: 'View, track, and submit your bootcamp assignments across all enrolled tracks.',
};

export default function AssignmentsPage() {
  return <AssignmentsClient />;
}
