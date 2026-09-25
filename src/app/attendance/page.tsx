import { Metadata } from 'next';
import { AttendanceClient } from '@/components/attendance/AttendanceClient';

export const metadata: Metadata = {
  title: 'Attendance & Participation | Bootcamp LMS — GDG on Campus LASU',
  description: 'View your live workshop attendance records, present rates, and excused session notes.',
};

export default function AttendancePage() {
  return <AttendanceClient />;
}
