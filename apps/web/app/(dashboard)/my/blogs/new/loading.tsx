export default function NewBlogLoading() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 pt-6 max-w-2xl mx-auto space-y-4">
      <div className="h-8 w-40 rounded-xl bg-gray-200 animate-pulse" />
      <div className="bg-white rounded-2xl p-6 space-y-5 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 w-20 rounded bg-gray-200" />
            <div className="h-10 w-full rounded-lg bg-gray-100" />
          </div>
        ))}
        <div className="space-y-1.5">
          <div className="h-3.5 w-20 rounded bg-gray-200" />
          <div className="h-32 w-full rounded-lg bg-gray-100" />
        </div>
        <div className="h-10 w-full rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
