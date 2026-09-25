import { redirect } from 'next/navigation';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentResources } from '@/lib/data/resources';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { ResourceLibraryClient } from '@/components/resources/ResourceLibraryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resource Library | Bootcamp LMS — GDG on Campus LASU',
  description: 'Access curated learning materials, starter repositories, slides, and cheat sheets from all enrolled bootcamp tracks.',
};

export default async function ResourcesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [resources, enrolledTracks] = await Promise.all([
    getStudentResources(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <ResourceLibraryClient
      initialResources={resources}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
