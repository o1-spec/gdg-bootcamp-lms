import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  getMentorSubmissions,
  getMentorAssignedTracks,
  getMentorAssignments,
} from '@/lib/data/mentor';
import { MentorSubmissionsClient } from '@/components/mentor/submissions/MentorSubmissionsClient';

export default async function MentorSubmissionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/submissions');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const [submissions, assignedTracks, assignments] = await Promise.all([
    getMentorSubmissions(user.id, user.role),
    getMentorAssignedTracks(user.id, user.role),
    getMentorAssignments(user.id, user.role),
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
    <MentorSubmissionsClient
      submissions={submissions}
      tracks={assignedTracks}
      assignments={assignments}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
