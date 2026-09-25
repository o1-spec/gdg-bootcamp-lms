import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorAnnouncements, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorAnnouncementsClient } from '@/components/mentor/announcements/MentorAnnouncementsClient';

export default async function MentorAnnouncementsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/announcements');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const [data, assignedTracks] = await Promise.all([
    getMentorAnnouncements(user.id, user.role),
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
    rawRole: user.role,
  };

  return (
    <MentorAnnouncementsClient
      announcements={data.announcements as any}
      tracks={data.tracks}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
