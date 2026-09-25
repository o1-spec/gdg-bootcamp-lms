import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentAssignmentDetails } from '@/lib/data/assignments';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { AssignmentDetailClient } from '@/components/assignments/AssignmentDetailClient';

interface PageProps {
  params: Promise<{
    assignmentId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { assignmentId } = await params;
  return {
    title: `${assignmentId} | Assignments | Bootcamp LMS`,
    description: 'View and submit bootcamp assignments',
  };
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { assignmentId } = await params;

  const [assignment, enrolledTracks] = await Promise.all([
    getStudentAssignmentDetails(assignmentId, user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  if (!assignment) {
    notFound();
  }

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <AssignmentDetailClient
      assignment={assignment}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
