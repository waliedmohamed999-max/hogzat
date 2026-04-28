"use client";

import { secureFetch } from "@/lib/client-security";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

type WishlistButtonProps = {
  productId: number;
  type: "home" | "experience" | "service";
  initialSaved?: boolean;
  isAuthenticated?: boolean;
  className?: string;
};

export function WishlistButton({
  productId,
  type,
  initialSaved = false,
  isAuthenticated = false,
  className = "",
}: WishlistButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (!isAuthenticated) {
      const nextUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?return_url=${nextUrl}`;
      return;
    }

    try {
      setPending(true);
      const response = await secureFetch("/api/v1/wishlist/toggle", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          type,
        }),
      });

      const payload = (await response.json()) as {
        status: number;
        data?: { is_favorite?: boolean };
      };

      if (response.ok && payload.status === 1) {
        setSaved(Boolean(payload.data?.is_favorite));
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-label={saved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      className={`absolute left-4 top-4 rounded-lg bg-white/90 p-3 text-slate-900 shadow-lg backdrop-blur transition hover:scale-105 disabled:cursor-wait disabled:opacity-70 ${saved ? "text-rose-500" : ""} ${className}`}
    >
      <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
