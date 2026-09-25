import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMentorDashboardData } from '@/lib/data/mentor';
import { MentorDashboardClient } from '@/components/mentor/dashboard/MentorDashboardClient';

export default async function MentorDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?from=/mentor/dashboard');
  }

  // Double check authorization: only MENTOR, ADMIN, or SUPER_ADMIN
  if (user.role === 'STUDENT') {
    redirect('/');
  }

  const data = await getMentorDashboardData(user.id, user.role);

  const mentorProfile = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: user.role === 'MENTOR' ? 'Track Mentor' : user.role === 'ADMIN' ? 'Platform Admin' : 'Super Administrator',
  };

  return (
    <MentorDashboardClient
      metrics={data.metrics}
      assignedTracks={data.assignedTracks}
      pendingSubmissions={data.pendingSubmissions}
      upcomingSessions={data.upcomingSessions}
      recentAnnouncements={data.recentAnnouncements}
      mentor={mentorProfile}
    />
  );
}
