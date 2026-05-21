export default function HomeLoading() {
  return (
    <main className="min-h-screen max-w-lg mx-auto">
      <div className="bg-[#0D0D0D] rounded-b-[2.5rem] h-64 animate-pulse" />
      <div className="space-y-5 p-4 pt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-36 bg-white rounded-2xl animate-pulse opacity-60"
          />
        ))}
      </div>
    </main>
  );
}
