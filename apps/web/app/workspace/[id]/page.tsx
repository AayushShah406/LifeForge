"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WorkspaceRedirectPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/workflows/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-[#8C82A2]">Opening workflow workspace...</p>
      </div>
    </div>
  );
}
