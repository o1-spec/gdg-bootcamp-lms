import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentProgress } from '@/lib/data/progress';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { ProgressClient } from '@/components/progress/ProgressClient';

export const metadata: Metadata = {
  title: 'My Progress & Milestones | Bootcamp LMS — GDG on Campus LASU',
  description: 'Track your learning journey across all enrolled tracks in the GDG on Campus LASU Bootcamp.',
};

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [progress, enrolledTracks] = await Promise.all([
    getStudentProgress(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <ProgressClient
      initialProgress={progress}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
