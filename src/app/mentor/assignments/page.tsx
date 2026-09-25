import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorAssignments, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorAssignmentsClient } from '@/components/mentor/assignments/MentorAssignmentsClient';

export default async function MentorAssignmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/assignments');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const [assignments, assignedTracks] = await Promise.all([
    getMentorAssignments(user.id, user.role),
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
    avatar: user.avatarUrl || '',
    role: user.role === 'MENTOR' ? 'Track Mentor' : user.role === 'ADMIN' ? 'Platform Admin' : 'Super Administrator',
  };

  return (
    <MentorAssignmentsClient
      assignments={assignments}
      tracks={assignedTracks}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
