import { redirect } from 'next/navigation';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentTracks, getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { TracksClient } from '@/components/tracks/TracksClient';

export default async function MyTracksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [tracks, enrolledTracksSummary] = await Promise.all([
    getStudentTracks(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, tracks.length);

  return (
    <TracksClient
      tracks={tracks}
      student={student}
      enrolledTracksSummary={enrolledTracksSummary}
    />
  );
}
