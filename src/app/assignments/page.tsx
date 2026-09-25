import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentAssignments } from '@/lib/data/assignments';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { AssignmentsClient } from '@/components/assignments/AssignmentsClient';

export const metadata: Metadata = {
  title: 'Assignments & Milestones | Bootcamp LMS — GDG on Campus LASU',
  description: 'View, track, and submit your bootcamp assignments across all enrolled tracks.',
};

export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [assignments, enrolledTracks] = await Promise.all([
    getStudentAssignments(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <AssignmentsClient
      initialAssignments={assignments}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
