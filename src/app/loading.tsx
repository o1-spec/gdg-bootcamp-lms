export default function RootLoading() {
  return (
    <div className="flex min-h-screen bg-[#FAF7EE] text-[#0D0E11] antialiased">
      {/* Sidebar Skeleton (hidden on small screens) */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#0D0E11] border-r border-[#22242B] p-6 shrink-0 space-y-6">
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
              style={{ animationDelay: `${i * 100}ms` }}
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
          {/* Hero Banner Skeleton */}
          <div className="h-56 sm:h-64 rounded-3xl bg-[#0D0E11] p-8 flex flex-col justify-between animate-pulse">
            <div className="space-y-3">
              <div className="w-32 h-4 rounded-full bg-white/10" />
              <div className="w-64 sm:w-96 h-8 rounded-full bg-white/15" />
              <div className="w-48 sm:w-80 h-4 rounded-full bg-white/10" />
            </div>
            <div className="w-40 h-10 rounded-full bg-[#FAF7EE]/20" />
          </div>

          {/* 4 Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white border border-[#E5DFD0] p-5 space-y-3 shadow-sm animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-24 h-3 bg-[#E5DFD0] rounded-full" />
                <div className="w-16 h-7 bg-[#0D0E11]/10 rounded-lg" />
                <div className="w-32 h-2.5 bg-[#E5DFD0]/80 rounded-full" />
              </div>
            ))}
          </div>

          {/* Cards Grid Skeleton */}
          <div className="space-y-4">
            <div className="w-48 h-6 bg-[#E5DFD0] rounded-full animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-white border border-[#E5DFD0] p-6 space-y-4 shadow-sm animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="w-full h-28 bg-[#E5DFD0]/50 rounded-2xl" />
                  <div className="w-3/4 h-4 bg-[#0D0E11]/10 rounded-full" />
                  <div className="w-1/2 h-3 bg-[#E5DFD0] rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
