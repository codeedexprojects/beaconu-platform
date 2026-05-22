export default function MyBlogsLoading() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 pt-6 max-w-2xl mx-auto space-y-4">
      <div className="h-8 w-40 rounded-xl bg-gray-200 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
