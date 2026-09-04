const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-landing shadow-[0_4px_16px_rgba(244,106,18,0.3)]">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-white" />
          </div>
          <span className="font-serif text-lg font-bold text-navy-dark">
            Beacon<span className="text-landing">U</span>
          </span>
        </a>

        <p className="order-3 text-center text-[0.8125rem] text-gray-label sm:order-2">
          © {new Date().getFullYear()} BeaconU Technologies. All rights
          reserved.
        </p>

        <div className="order-2 flex items-center gap-6 sm:order-3">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[0.8125rem] font-medium text-navy-dark transition-colors hover:text-landing"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
