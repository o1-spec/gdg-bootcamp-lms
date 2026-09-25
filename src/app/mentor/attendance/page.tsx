import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorAttendanceData, getMentorAssignedTracks } from '@/lib/data/mentor';
import { MentorAttendanceClient } from '@/components/mentor/attendance/MentorAttendanceClient';

interface PageProps {
  searchParams: Promise<{
    trackId?: string;
    sessionId?: string;
  }>;
}

export default async function MentorAttendancePage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/attendance');
  }

  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const { trackId, sessionId } = await searchParams;

  const [data, assignedTracks] = await Promise.all([
    getMentorAttendanceData(user.id, user.role, trackId, sessionId),
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
    <MentorAttendanceClient
      key={`${trackId || 't'}-${sessionId || 's'}`}
      tracks={data.tracks}
      activeTrack={data.activeTrack}
      activeSession={data.activeSession}
      initialStudents={data.studentsAttendance}
      mentor={mentorProfile}
      metrics={{
        assignedTracksCount: assignedTracks.length,
        pendingSubmissionsCount,
      }}
    />
  );
}
