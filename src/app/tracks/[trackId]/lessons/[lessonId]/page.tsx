import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getLessonDetails } from '@/lib/data/lessons';
import { getStudentTrackBySlug, getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { LessonViewClient } from '@/components/lesson/LessonViewClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    trackId: string;
    lessonId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { trackId, lessonId } = await params;
  return {
    title: `${lessonId} | ${trackId} | Bootcamp LMS`,
    description: 'Bootcamp LMS interactive lesson learning experience',
  };
}

export default async function LessonPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { trackId, lessonId } = await params;

  const [lesson, track, enrolledTracks] = await Promise.all([
    getLessonDetails(trackId, lessonId, user.id),
    getStudentTrackBySlug(trackId, user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  if (!lesson) {
    notFound();
  }

  // Find module lessons from track
  const currentModule =
    track?.modules.find((m) => m.id === lesson.moduleId || m.title === lesson.moduleName) ||
    track?.modules[0];

  const moduleLessons =
    currentModule?.lessons.map((l) => ({
      id: l.id,
      slug: l.id,
      title: l.title,
      durationMinutes: l.durationMinutes,
      isCompleted: l.status === 'completed',
      isCurrent: l.id === lesson.id || l.title === lesson.title,
    })) || [
      {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        isCompleted: lesson.status === 'completed',
        isCurrent: true,
      },
    ];

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <LessonViewClient
      lesson={lesson}
      moduleLessons={moduleLessons}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
