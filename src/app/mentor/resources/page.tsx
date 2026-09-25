import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorResources, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorResourcesClient } from '@/components/mentor/resources/MentorResourcesClient';

export default async function MentorResourcesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/resources');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const [resourceData, assignedTracks] = await Promise.all([
    getMentorResources(user.id, user.role),
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
    <MentorResourcesClient
      tracks={resourceData.tracks}
      resources={resourceData.resources}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
