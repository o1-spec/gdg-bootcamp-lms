import { notFound } from 'next/navigation';
import { mockDetailedTracks } from '@/data/tracks';
import { TrackDetailClient } from '@/components/tracks/TrackDetailClient';

interface PageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export function generateStaticParams() {
  return [
    { trackId: 'backend-development' },
    { trackId: 'frontend-development' },
    { trackId: 'dsa-interview-prep' },
  ];
}

export default async function TrackDetailPage({ params }: PageProps) {
  const { trackId } = await params;

  const track = mockDetailedTracks[trackId] || mockDetailedTracks['backend-development'];

  if (!track) {
    notFound();
  }

  return <TrackDetailClient track={track} />;
}
