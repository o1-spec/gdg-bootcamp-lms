import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorSchedule, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorScheduleClient } from '@/components/mentor/schedule/MentorScheduleClient';

export default async function MentorSchedulePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/schedule');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const [sessions, assignedTracks] = await Promise.all([
    getMentorSchedule(user.id, user.role),
    getMentorAssignedTracks(user.id, user.role),
  ]);

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
    <MentorScheduleClient
      sessions={sessions as any}
      tracks={assignedTracks}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
