"use client";

import { useRef } from "react";
import Image from "next/image";
import { IconCamera, IconTrash } from "@tabler/icons-react";

export function FotoSlot({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  if (value) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100">
        <Image
          src={value}
          alt="Foto"
          fill
          className="object-cover"
          unoptimized
          sizes="120px"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white"
        >
          <IconTrash size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
    >
      <IconCamera size={24} />
      <span className="text-xs">Foto</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}
