import { Metadata } from 'next';
import { ProgressClient } from '@/components/progress/ProgressClient';

export const metadata: Metadata = {
  title: 'My Progress & Milestones | Bootcamp LMS — GDG on Campus LASU',
  description: 'Track your learning journey across all enrolled tracks in the GDG on Campus LASU Bootcamp.',
};

export default function ProgressPage() {
  return <ProgressClient />;
}
