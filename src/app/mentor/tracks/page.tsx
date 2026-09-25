import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorTracksClient } from '@/components/mentor/tracks/MentorTracksClient';

export default async function MentorTracksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/tracks');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const tracks = await getMentorAssignedTracks(user.id, user.role);

  const pendingCount = tracks.reduce((acc, t) => acc + t.pendingSubmissionsCount, 0);

  const mentorProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: user.role === 'MENTOR' ? 'Track Mentor' : user.role === 'ADMIN' ? 'Platform Admin' : 'Super Administrator',
  };

  return (
    <MentorTracksClient
      tracks={tracks}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: tracks.length,
        pendingSubmissionsCount: pendingCount,
      }}
    />
  );
}
