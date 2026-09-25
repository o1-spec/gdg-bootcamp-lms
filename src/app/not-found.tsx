import Link from 'next/link';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7EE] text-[#0D0E11] p-6 antialiased selection:bg-[#FBBC04]/30">
      <div className="max-w-md w-full rounded-3xl border border-[#E5DFD0] bg-white p-8 sm:p-10 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-[#EA4335]/10 text-[#EA4335] px-3 py-1 text-xs font-black uppercase tracking-wider">
            404 • Not Found
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0D0E11] tracking-tight">
            Page or Resource Not Found
          </h2>
          <p className="text-sm text-[#5F6368] leading-relaxed">
            The track, lesson, assignment, or resource you are looking for does not exist, may have moved, or is restricted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0D0E11] hover:bg-[#22242B] text-white px-6 py-3 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            href="/tracks"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#E5DFD0] bg-[#FAF7EE] hover:bg-[#E5DFD0] text-[#0D0E11] px-6 py-3 text-xs font-bold transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View All Tracks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
