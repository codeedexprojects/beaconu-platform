import Link from "next/link";

const BackArrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

interface Props {
  backHref: string;
  backLabel?: string;
  title: string;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
}

export function BlogHeader({
  backHref,
  backLabel = "Back",
  title,
  rightAction,
  children,
}: Props) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={backHref}
              aria-label={backLabel}
              className="flex items-center justify-center w-9 h-9 rounded-[10px] border border-gray-200 bg-white hover:bg-gray-50 transition-colors shrink-0"
            >
              <BackArrow />
            </Link>
            <span className="text-[15px] font-semibold text-gray-900 truncate">
              {title}
            </span>
          </div>
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </div>
        {children}
      </div>
    </header>
  );
}
