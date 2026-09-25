import { Metadata } from 'next';
import { ScheduleClient } from '@/components/schedule/ScheduleClient';

export const metadata: Metadata = {
  title: 'Bootcamp Schedule & Live Classes | Bootcamp LMS — GDG on Campus LASU',
  description: 'Stay on top of your classes, workshops, and important bootcamp sessions across all tracks.',
};

export default function SchedulePage() {
  return <ScheduleClient />;
}
