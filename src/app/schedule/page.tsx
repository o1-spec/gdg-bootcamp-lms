import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentSchedule } from '@/lib/data/schedule';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { ScheduleClient } from '@/components/schedule/ScheduleClient';

export const metadata: Metadata = {
  title: 'Bootcamp Schedule & Live Classes | Bootcamp LMS — GDG on Campus LASU',
  description: 'Stay on top of your classes, workshops, and important bootcamp sessions across all tracks.',
};

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [sessions, enrolledTracks] = await Promise.all([
    getStudentSchedule(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <ScheduleClient
      initialSessions={sessions}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
