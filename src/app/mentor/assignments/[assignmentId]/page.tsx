import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorAssignmentDetail, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorAssignmentDetailClient } from '@/components/mentor/assignments/MentorAssignmentDetailClient';

interface PageProps {
  params: Promise<{
    assignmentId: string;
  }>;
}

export default async function MentorAssignmentDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/assignments');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const { assignmentId } = await params;

  const [detail, assignedTracks] = await Promise.all([
    getMentorAssignmentDetail(user.id, assignmentId, user.role),
    getMentorAssignedTracks(user.id, user.role),
  ]);

  if (!detail) {
    notFound();
  }

  const pendingSubmissionsCount = assignedTracks.reduce(
    (acc, t) => acc + t.pendingSubmissionsCount,
    0
  );

  const mentorProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: user.role === 'MENTOR' ? 'Track Mentor' : user.role === 'ADMIN' ? 'Platform Admin' : 'Super Administrator',
  };

  return (
    <MentorAssignmentDetailClient
      assignment={detail.assignment}
      counts={detail.counts}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
