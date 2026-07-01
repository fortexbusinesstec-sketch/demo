"use client";

import { IconDeviceDesktop, IconUsers } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default function LeadsLoginPage() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center p-5"
      style={{
        background: "linear-gradient(135deg, #8a161c 0%, #c12128 50%, #d42f36 100%)",
      }}
    >
      <div className="w-full max-w-[480px] rounded-3xl bg-white/97 px-9 py-12 shadow-2xl shadow-black/30 max-sm:px-6 max-sm:py-8">
        <Image
          src="/logo-azur.png"
          alt="Azur Constructora e Inmobiliaria"
          width={400}
          height={169}
          className="mx-auto mb-5 h-auto w-48 max-sm:w-40"
          priority
        />

        <Link
          href="/leads/fabrizio"
          className="mb-3 flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-semibold text-white transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #c12128, #d42f36)",
          }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <IconUsers size={20} className="text-white" />
          </span>
          <span className="leading-tight">
            Asistente de Proyectos
            <small className="mt-0.5 block text-[11px] font-normal opacity-75">
              Registro y seguimiento de leads
            </small>
          </span>
        </Link>

        <Link
          href="/leads/henrry"
          className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-semibold text-white transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #292134, #3d2f4a)",
          }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <IconDeviceDesktop size={20} className="text-white" />
          </span>
          <span className="leading-tight">
            Gerente de Proyectos
            <small className="mt-0.5 block text-[11px] font-normal opacity-75">
              Coordinación y reporte de seguimiento
            </small>
          </span>
        </Link>

        <p className="mt-7 text-center text-xs" style={{ color: "#A0AEC0" }}>
          &copy; 2026 Azur Constructora e Inmobiliaria
        </p>
      </div>
    </div>
  );
}
