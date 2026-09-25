import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getCurrentUser, buildStudentProfile } from '@/lib/auth';
import { getStudentAttendance } from '@/lib/data/attendance';
import { getStudentEnrolledTracksSummary } from '@/lib/data/tracks';
import { AttendanceClient } from '@/components/attendance/AttendanceClient';

export const metadata: Metadata = {
  title: 'Attendance & Participation | Bootcamp LMS — GDG on Campus LASU',
  description: 'View your live workshop attendance records, present rates, and excused session notes.',
};

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [attendanceData, enrolledTracks] = await Promise.all([
    getStudentAttendance(user.id),
    getStudentEnrolledTracksSummary(user.id),
  ]);

  const student = buildStudentProfile(user, enrolledTracks.length);

  return (
    <AttendanceClient
      initialSummary={attendanceData.summary}
      initialRecords={attendanceData.records}
      student={student}
      enrolledTracks={enrolledTracks}
    />
  );
}
