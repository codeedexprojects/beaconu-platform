export default function NewsAlertsLoading() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] max-w-lg mx-auto">
      <div className="bg-[#0D0D0D] rounded-b-[2.5rem] h-48 animate-pulse" />
      <div className="space-y-4 p-4 pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-white rounded-2xl animate-pulse opacity-70"
          />
        ))}
      </div>
    </main>
  );
}
