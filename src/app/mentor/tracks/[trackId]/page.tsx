import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorTrackDetail, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorTrackDetailClient } from '@/components/mentor/tracks/MentorTrackDetailClient';

interface PageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export default async function MentorTrackDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/tracks');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const { trackId } = await params;

  const [trackDetail, assignedTracks] = await Promise.all([
    getMentorTrackDetail(user.id, trackId, user.role),
    getMentorAssignedTracks(user.id, user.role),
  ]);

  if (!trackDetail) {
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
    avatar: user.avatarUrl || '',
    role: user.role === 'MENTOR' ? 'Track Mentor' : user.role === 'ADMIN' ? 'Platform Admin' : 'Super Administrator',
  };

  return (
    <MentorTrackDetailClient
      track={trackDetail.track}
      resources={trackDetail.resources}
      students={trackDetail.students}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
