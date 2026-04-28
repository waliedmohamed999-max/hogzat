"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { secureFetch } from "@/lib/client-security";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    secureFetch("/api/session/logout", { method: "POST", cache: "no-store" }).finally(() => {
      if (mounted) {
        router.replace("/auth/login");
        router.refresh();
      }
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
