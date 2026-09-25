import { Metadata } from 'next';
import { ResourceLibraryClient } from '@/components/resources/ResourceLibraryClient';

export const metadata: Metadata = {
  title: 'Resource Library | Bootcamp LMS — GDG on Campus LASU',
  description: 'Access curated learning materials, starter repositories, slides, and cheat sheets from all enrolled bootcamp tracks.',
};

export default function ResourcesPage() {
  return <ResourceLibraryClient />;
}
