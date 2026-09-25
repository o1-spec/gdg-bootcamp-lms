import { notFound } from 'next/navigation';
import { getLessonBySlug } from '@/data/lessons';
import { LessonViewClient } from '@/components/lesson/LessonViewClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    trackId: string;
    lessonId: string;
  }>;
}

export function generateStaticParams() {
  return [
    { trackId: 'backend-development', lessonId: 'rest-api-design' },
    { trackId: 'backend-development', lessonId: 'express-fundamentals' },
    { trackId: 'backend-development', lessonId: 'middleware' },
    { trackId: 'backend-development', lessonId: 'validation' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessonBySlug(lessonId);
  return {
    title: lesson ? `${lesson.title} | Bootcamp LMS` : 'Lesson | Bootcamp LMS',
    description: lesson?.description || 'Bootcamp LMS interactive lesson experience',
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { trackId, lessonId } = await params;

  const lesson = getLessonBySlug(lessonId);

  if (!lesson) {
    notFound();
  }

  // Current module lessons for Building APIs (Module 3)
  const moduleLessons = [
    {
      id: 'les-301',
      slug: 'express-fundamentals',
      title: 'Express Fundamentals',
      durationMinutes: 45,
      isCompleted: true,
      isCurrent: lessonId === 'express-fundamentals',
    },
    {
      id: 'les-302',
      slug: 'rest-api-design',
      title: 'REST API Design',
      durationMinutes: 35,
      isCompleted: false,
      isCurrent: lessonId === 'rest-api-design' || !lessonId,
    },
    {
      id: 'les-303',
      slug: 'middleware',
      title: 'Middleware',
      durationMinutes: 40,
      isCompleted: false,
      isCurrent: lessonId === 'middleware',
    },
    {
      id: 'les-304',
      slug: 'validation',
      title: 'Validation',
      durationMinutes: 35,
      isCompleted: false,
      isCurrent: lessonId === 'validation',
    },
    {
      id: 'les-305',
      slug: 'error-handling',
      title: 'Error Handling',
      durationMinutes: 40,
      isCompleted: false,
      isCurrent: lessonId === 'error-handling',
    },
  ];

  return (
    <LessonViewClient
      lesson={{ ...lesson, trackId }}
      moduleLessons={moduleLessons}
    />
  );
}
