"use client";

import { memo } from "react";
import {
  IconBuildingFactory,
  IconBuilding,
  IconHammer,
  IconTools,
  IconHome,
  IconBuildingStore,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClienteRow } from "../actions";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof IconBuildingFactory> = {
  EPS: IconBuildingFactory,
  "Gerencia Regional": IconBuilding,
  Constructora: IconHammer,
  Ferretería: IconTools,
  Inmobiliaria: IconHome,
  Otro: IconBuildingStore,
};

const estadoColor: Record<string, string> = {
  "Por visitar": "bg-slate-100 text-slate-800 border-slate-200",
  Visitado: "bg-sky-100 text-sky-800 border-sky-200",
  "Cotización enviada": "bg-amber-100 text-amber-800 border-amber-200",
  Negociación: "bg-orange-100 text-orange-800 border-orange-200",
  Cerrado: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Rechazado: "bg-red-100 text-red-800 border-red-200",
};

const estadoBg: Record<string, string> = {
  "Por visitar": "",
  Visitado: "bg-zinc-50",
  "Cotización enviada": "bg-amber-50/40",
  Negociación: "bg-orange-50/40",
  Cerrado: "bg-emerald-50/40",
  Rechazado: "bg-red-50/40",
};

export const ClienteCard = memo(function ClienteCard({
  cliente,
  onRegistrarVisita,
}: {
  cliente: ClienteRow;
  onRegistrarVisita: () => void;
}) {
  const Icon = iconMap[cliente.tipo_cliente] || IconBuildingStore;
  const badgeColor = estadoColor[cliente.estado] || "";
  const cardBg = estadoBg[cliente.estado] || "";

  return (
    <Card className={cn("flex flex-row items-center gap-3 py-4 px-2.5", cardBg)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        <Icon size={22} />
      </div>

      <h3 className="flex-1 text-base font-semibold text-zinc-900 leading-tight">
        {cliente.nombre_entidad}
      </h3>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant="outline" className={badgeColor}>{cliente.estado}</Badge>
        <button
          type="button"
          onClick={onRegistrarVisita}
          className="flex h-9 items-center gap-1 rounded-full bg-sky-500 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600 active:bg-sky-700"
        >
          <IconClipboardCheck size={15} />
          Registrar
        </button>
      </div>
    </Card>
  );
});
