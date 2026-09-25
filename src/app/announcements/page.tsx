import { Metadata } from 'next';
import { AnnouncementsClient } from '@/components/announcements/AnnouncementsClient';

export const metadata: Metadata = {
  title: 'Announcements & Bulletins | Bootcamp LMS — GDG on Campus LASU',
  description: 'Stay updated with important bootcamp notices, schedule shifts, and cohort announcements.',
};

export default function AnnouncementsPage() {
  return <AnnouncementsClient />;
}
