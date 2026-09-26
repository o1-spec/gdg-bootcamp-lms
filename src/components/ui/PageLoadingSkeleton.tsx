export function PageLoadingSkeleton({
  title = "Loading...",
  subtitle = "Fetching your curriculum data...",
  cardCount = 3,
}: {
  title?: string;
  subtitle?: string;
  cardCount?: number;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased">
      {/* Sidebar Skeleton (desktop) */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#0D0E11] border-r border-[#22242B] p-6 shrink-0 space-y-6 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="w-28 h-3.5 bg-white/10 rounded-full animate-pulse" />
            <div className="w-20 h-2.5 bg-white/5 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 pt-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-10 rounded-xl bg-white/5 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header Skeleton */}
        <header className="h-20 border-b border-[#E5DFD0] bg-[#FAF7EE]/90 backdrop-blur px-6 sm:px-8 flex items-center justify-between">
          <div className="w-48 sm:w-72 h-10 rounded-full bg-[#E5DFD0]/60 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E5DFD0]/60 animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-[#E5DFD0]/60 animate-pulse" />
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header Title Skeleton */}
          <div className="space-y-2 animate-pulse">
            <div className="w-48 h-8 rounded-lg bg-[#0D0E11]/10" />
            <div className="w-72 h-4 rounded-full bg-[#E5DFD0]" />
          </div>

          {/* Filter Bar Skeleton */}
          <div className="flex flex-wrap gap-3 items-center justify-between animate-pulse">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-9 rounded-full bg-[#E5DFD0]/70" />
              ))}
            </div>
            <div className="w-64 h-9 rounded-full bg-[#E5DFD0]/70" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: cardCount }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-white border border-[#E5DFD0] p-6 space-y-4 shadow-sm animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-full h-24 bg-[#E5DFD0]/40 rounded-2xl" />
                <div className="w-3/4 h-4 bg-[#0D0E11]/10 rounded-full" />
                <div className="w-1/2 h-3 bg-[#E5DFD0] rounded-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
