import Link from "next/link";

const BackArrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
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
  maxWidth?: string;
}

export function BlogHeader({
  backHref,
  backLabel = "Back",
  title,
  rightAction,
  children,
  maxWidth = "max-w-5xl",
}: Props) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className={`${maxWidth} mx-auto px-4 md:px-6`}>
        <div className="h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={backHref}
              aria-label={backLabel}
              className="flex items-center justify-center w-9 h-9 rounded-xl border-[1.5px] border-gray-300 bg-white text-gray-600 hover:border-[#E8521A] hover:text-[#E8521A] hover:bg-[#FEF0EB] transition-all shrink-0 shadow-sm"
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
