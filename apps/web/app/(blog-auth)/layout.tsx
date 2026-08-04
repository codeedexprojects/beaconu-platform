import Link from "next/link";

export default function BlogAuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-3xl" />

      <div className="absolute top-5 right-5">
        <Link
          href="/blogs"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          Browse Blogs
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {children}
      </div>
    </div>
  );
}
