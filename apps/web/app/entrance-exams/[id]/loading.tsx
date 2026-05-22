export default function EntranceExamLoading() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] max-w-lg mx-auto p-4 pt-6 space-y-4">
      <div className="h-48 bg-white rounded-2xl animate-pulse" />
      <div className="h-6 bg-white rounded-xl animate-pulse w-3/4" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-white rounded-lg animate-pulse opacity-70"
          />
        ))}
      </div>
    </main>
  );
}
