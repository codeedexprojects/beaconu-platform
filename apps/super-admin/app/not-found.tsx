import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFoundPage(): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="relative text-center space-y-6 animate-fade-in">
        {/* 404 number */}
        <div className="relative inline-block">
          <span className="text-[9rem] font-black leading-none tracking-tighter text-white/5 select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[2.5rem] font-black text-white tracking-tight">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-white">Page not found</h1>
          <p className="text-sm text-white/40 max-w-xs mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
