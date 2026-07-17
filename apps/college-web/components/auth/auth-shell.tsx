interface AuthShellProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export function AuthShell({ eyebrow, title, children }: AuthShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-sm flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
      <div className="mt-8">{children}</div>
    </div>
  );
}
