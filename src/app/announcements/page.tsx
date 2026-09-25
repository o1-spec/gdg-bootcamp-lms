import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentAnnouncements } from '@/lib/data/announcements';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { AnnouncementsClient } from '@/components/announcements/AnnouncementsClient';

export const metadata: Metadata = {
  title: 'Announcements & Bulletins | Bootcamp LMS — GDG on Campus LASU',
  description: 'Stay updated with important bootcamp notices, schedule shifts, and cohort announcements.',
};

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [announcements, enrolledTracks] = await Promise.all([
    getStudentAnnouncements(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <AnnouncementsClient
      initialAnnouncements={announcements}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
