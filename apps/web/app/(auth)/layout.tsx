export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex items-start sm:items-center justify-center sm:py-8 sm:px-4">
      <div className="relative w-full sm:max-w-md sm:rounded-3xl sm:shadow-lg sm:ring-1 sm:ring-gray-100 bg-white overflow-hidden">
        {/* Decorative peach circles */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#FACCB0]" />
        <div className="pointer-events-none absolute -top-10 left-36 w-56 h-56 rounded-full bg-[#FACCB0]/75" />

        <div className="relative z-10 px-6 sm:px-8 pt-14 pb-10">{children}</div>
      </div>
    </div>
  );
}
