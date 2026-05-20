"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStudentAuthStore } from "@/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useStudentAuthStore((s) => s.token);
  const hasHydrated = useStudentAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-lg font-black text-white">B</span>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return <div className="bg-[#F5F5F5] min-h-screen">{children}</div>;
}
