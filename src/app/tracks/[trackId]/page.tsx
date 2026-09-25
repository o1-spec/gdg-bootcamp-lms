import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentTrackBySlug, getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { TrackDetailClient } from '@/components/tracks/TrackDetailClient';

interface PageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export default async function TrackDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { trackId } = await params;
  const [track, enrolledTracks] = await Promise.all([
    getStudentTrackBySlug(trackId, user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  if (!track) {
    notFound();
  }

  const student = buildStudentProfile(user, enrolledTracks.length);

  return <TrackDetailClient track={track} student={student} enrolledTracks={enrolledTracks} />;
}
