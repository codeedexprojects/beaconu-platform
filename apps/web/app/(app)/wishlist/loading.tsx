export default function WishlistLoading() {
  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-2xl animate-pulse opacity-60"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
