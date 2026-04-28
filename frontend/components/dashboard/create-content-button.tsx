"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type CreateContentButtonProps = {
  resource: "posts" | "pages";
  label: string;
};

export function CreateContentButton({
  resource,
  label,
}: CreateContentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleCreate() {
    startTransition(() => {
      router.push(`/dashboard/${resource}/new`);
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        <Plus className="size-4" />
        {label}
      </button>
    </div>
  );
}
