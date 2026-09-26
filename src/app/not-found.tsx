import Link from 'next/link';
import Image from 'next/image';
import { Compass, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gdg-cream text-gdg-black p-6 antialiased selection:bg-gdg-yellow/30">
      <div className="max-w-md w-full rounded-3xl border border-gdg-border bg-white p-8 sm:p-10 shadow-lg text-center space-y-6">
        <div className="flex justify-center mb-2">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Image
              src="/GDGOC-LASU-logo.webp"
              alt="GDG on Campus LASU Logo"
              width={220}
              height={42}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gdg-blue/10 border border-gdg-blue/20 text-gdg-blue flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-gdg-red/10 text-gdg-red px-3 py-1 text-xs font-black uppercase tracking-wider">
            404 • Not Found
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gdg-black tracking-tight">
            Page or Resource Not Found
          </h2>
          <p className="text-sm text-gdg-gray leading-relaxed">
            The track, lesson, assignment, or resource you are looking for does not exist, may have moved, or is restricted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gdg-black hover:bg-gdg-dark-border text-white px-6 py-3 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            href="/tracks"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-gdg-border bg-gdg-cream hover:bg-gdg-border text-gdg-black px-6 py-3 text-xs font-bold transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View All Tracks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
