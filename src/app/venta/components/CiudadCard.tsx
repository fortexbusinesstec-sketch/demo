"use client";

import { memo } from "react";
import {
  IconBuildingWarehouse,
  IconBuildingSkyscraper,
  IconAnchor,
  IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const config: Record<
  string,
  {
    icon: typeof IconBuildingWarehouse;
    bg: string;
    border: string;
    badgeClass: string;
  }
> = {
  Chiclayo: {
    icon: IconBuildingWarehouse,
    bg: "bg-slate-50",
    border: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
  Trujillo: {
    icon: IconBuildingSkyscraper,
    bg: "bg-blue-50",
    border: "border-blue-200",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
  },
  Chimbote: {
    icon: IconAnchor,
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200",
  },
};

export const CiudadCard = memo(function CiudadCard({
  nombre,
  conteo,
  onSelect,
}: {
  nombre: string;
  conteo: number;
  onSelect: () => void;
}) {
  const cfg = config[nombre];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left shadow-sm transition-all active:scale-[0.98]",
        cfg.bg,
        cfg.border
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Icon size={28} className="text-zinc-700" />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold text-zinc-900">{nombre}</h2>
        <Badge variant="outline" className={cn("mt-1", cfg.badgeClass)}>
          {conteo} por visitar
        </Badge>
      </div>
      <IconChevronRight size={24} className="text-zinc-400" />
    </button>
  );
});
