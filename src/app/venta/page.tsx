"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconDroplet,
  IconArrowLeft,
  IconBuildingFactory,
  IconBuilding,
  IconHammer,
  IconTools,
  IconHome,
  IconBuildingStore,
  IconPlus,
  IconMapPin,
} from "@tabler/icons-react";
import { CiudadCard } from "./components/CiudadCard";
import { ClienteCard } from "./components/ClienteCard";
import { VisitaSheet } from "./components/VisitaSheet";
import { CrearClienteSheet } from "./components/CrearClienteSheet";
import type { ClienteRow, ConteoCiudad } from "./actions";

import { getAllConteos, getClientesByCiudadGrouped, getCiudades } from "./actions";

type Screen = "dashboard" | "ciudad";

const tipoClienteIcons: Record<string, typeof IconBuildingFactory> = {
  EPS: IconBuildingFactory,
  "Gerencia Regional": IconBuilding,
  Constructora: IconHammer,
  Ferretería: IconTools,
  Inmobiliaria: IconHome,
  Otro: IconBuildingStore,
};

export default function VentaPage() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string>("");
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [conteos, setConteos] = useState<ConteoCiudad[]>([]);
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [clienteSheet, setClienteSheet] = useState<ClienteRow | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [crearSheetOpen, setCrearSheetOpen] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<ClienteRow | null>(null);

  useEffect(() => {
    getCiudades().then(setCiudades);
    getAllConteos().then(setConteos);
  }, []);

  const loadClientes = useCallback(
    async (ciudad: string) => {
      setLoadingClientes(true);
      const data = await getClientesByCiudadGrouped(ciudad);
      setClientes(data);
      setLoadingClientes(false);
    },
    []
  );

  const refreshConteos = useCallback(() => {
    getAllConteos().then(setConteos);
  }, []);

  const handleSelectCiudad = useCallback((ciudad: string) => {
    setCiudadSeleccionada(ciudad);
    setScreen("ciudad");
    getClientesByCiudadGrouped(ciudad).then((data) => {
      setClientes(data);
    });
  }, []);

  const handleBack = useCallback(() => {
    setScreen("dashboard");
    setCiudadSeleccionada("");
    setClientes([]);
  }, []);

  const handleRegistrarVisita = useCallback((cliente: ClienteRow) => {
    setClienteSheet(cliente);
    setSheetOpen(true);
  }, []);

  const handleVisitaSuccess = useCallback(() => {
    loadClientes(ciudadSeleccionada);
    refreshConteos();
  }, [ciudadSeleccionada, loadClientes, refreshConteos]);

  const handleEditarCliente = useCallback((cliente: ClienteRow) => {
    setClienteEditar(cliente);
    setCrearSheetOpen(true);
  }, []);

  const handleCrearClienteSuccess = useCallback(() => {
    refreshConteos();
    if (screen === "ciudad") {
      loadClientes(ciudadSeleccionada);
    }
  }, [screen, ciudadSeleccionada, loadClientes, refreshConteos]);

  const getConteo = useCallback(
    (ciudad: string) => {
      const c = conteos.find((c) => c.ciudad === ciudad);
      return c ? c.por_visitar : 0;
    },
    [conteos]
  );

  const handleCrearOpen = useCallback(() => {
    setClienteEditar(null);
    setCrearSheetOpen(true);
  }, []);

  const handleCrearSheetChange = useCallback((open: boolean) => {
    setCrearSheetOpen(open);
    if (!open) setClienteEditar(null);
  }, []);

  const handleVisitaSheetChange = useCallback((open: boolean) => {
    setSheetOpen(open);
  }, []);

  const handleEditarFromVisita = useCallback((cliente: ClienteRow) => {
    setClienteEditar(cliente);
    setCrearSheetOpen(true);
  }, []);

  const distritosAgrupados = useMemo(() => {
    const map = new Map<string, Map<string, ClienteRow[]>>();
    for (const c of clientes) {
      const d = c.distrito || "Sin distrito";
      if (!map.has(d)) map.set(d, new Map());
      const tm = map.get(d)!;
      if (!tm.has(c.tipo_cliente)) tm.set(c.tipo_cliente, []);
      tm.get(c.tipo_cliente)!.push(c);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a === "Sin distrito" ? 1 : b === "Sin distrito" ? -1 : a.localeCompare(b)))
      .map(([distrito, tm]) => ({
        distrito,
        tipos: Array.from(tm.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([tipo, clientes]) => ({ tipo, clientes })),
      }));
  }, [clientes]);

  if (screen === "ciudad") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col bg-white px-4 py-3 md:px-8">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            <IconArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-xl font-bold text-zinc-900 md:text-2xl">{ciudadSeleccionada}</h1>
          <button
            type="button"
            onClick={handleCrearOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          >
            <IconPlus size={22} />
          </button>
        </div>

        {loadingClientes && clientes.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">Cargando...</p>
        ) : clientes.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No hay clientes en esta ciudad</p>
        ) : (
          <>
            {loadingClientes && (
              <div className="sticky top-0 z-10 -mx-4 mb-2 flex items-center justify-center gap-2 bg-white/80 px-4 py-2 text-xs text-zinc-400 backdrop-blur-sm md:-mx-8">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
                Actualizando...
              </div>
            )}
            <div className="flex flex-col gap-6">
              {distritosAgrupados.map((dg) => (
                <div key={dg.distrito} style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 200px' }}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                      <IconMapPin size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900">{dg.distrito}</h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                      {dg.tipos.reduce((s, t) => s + t.clientes.length, 0)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {dg.tipos.map((tg) => {
                      const TipoIcon = tipoClienteIcons[tg.tipo] || IconBuildingStore;
                      return (
                        <div key={tg.tipo}>
                          <div className="mb-2 flex items-center gap-1.5 px-1">
                            <TipoIcon size={15} className="text-zinc-400" />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                              {tg.tipo}
                            </h3>
                            <span className="text-xs text-zinc-300">({tg.clientes.length})</span>
                          </div>
                          <div className="flex flex-col gap-2 md:grid md:grid-cols-2 lg:grid-cols-3">
                            {tg.clientes.map((cliente) => (
                              <ClienteCard
                                key={cliente.id}
                                cliente={cliente}
                                onRegistrarVisita={() => handleRegistrarVisita(cliente)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <VisitaSheet
          open={sheetOpen}
          onOpenChange={handleVisitaSheetChange}
          cliente={clienteSheet}
          onSuccess={handleVisitaSuccess}
          onEditarCliente={handleEditarFromVisita}
        />

        <CrearClienteSheet
          key={clienteEditar?.id ?? "new"}
          open={crearSheetOpen}
          onOpenChange={handleCrearSheetChange}
          onSuccess={handleCrearClienteSuccess}
          cliente={clienteEditar}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col bg-white px-4 py-3 md:px-8 md:py-6">
      <div className="mb-4 flex items-center gap-3 md:mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 md:h-14 md:w-14">
          <IconDroplet size={26} className="text-sky-500 md:size-[30px]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 md:text-3xl">Medidores de Agua</h1>
          <p className="text-sm text-zinc-500 md:text-base">Henrry Díaz</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
        {ciudades.map((ciudad) => (
          <CiudadCard
            key={ciudad}
            nombre={ciudad}
            conteo={getConteo(ciudad)}
            onSelect={() => handleSelectCiudad(ciudad)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleCrearOpen}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-all hover:bg-sky-600 active:scale-95 md:bottom-8 md:right-8"
      >
        <IconPlus size={28} />
      </button>

      <CrearClienteSheet
        key={clienteEditar?.id ?? "new"}
        open={crearSheetOpen}
        onOpenChange={handleCrearSheetChange}
        onSuccess={handleCrearClienteSuccess}
        cliente={clienteEditar}
      />
    </div>
  );
}
