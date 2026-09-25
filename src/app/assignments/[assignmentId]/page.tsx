import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { mockFullAssignments, getAssignmentById } from '@/data/assignments';
import { AssignmentDetailClient } from '@/components/assignments/AssignmentDetailClient';

interface PageProps {
  params: Promise<{
    assignmentId: string;
  }>;
}

export function generateStaticParams() {
  return mockFullAssignments.map((a) => ({
    assignmentId: a.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { assignmentId } = await params;
  const assignment = getAssignmentById(assignmentId);
  return {
    title: assignment
      ? `${assignment.title} | Bootcamp LMS`
      : 'Assignment Detail | Bootcamp LMS',
    description: assignment?.shortDescription || 'View and submit bootcamp assignments',
  };
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { assignmentId } = await params;
  const assignment = getAssignmentById(assignmentId);

  if (!assignment) {
    notFound();
  }

  return <AssignmentDetailClient assignment={assignment} />;
}
