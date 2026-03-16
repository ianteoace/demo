"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui"

import { loadDemoDataAction } from "../actions/load-demo-data"
import type { LoadDemoDataActionResult } from "../actions/load-demo-data.types"

export default function LoadDemoDataButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<LoadDemoDataActionResult | null>(null)
  const isProduction = process.env.NODE_ENV === "production"

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
      <p className="text-sm font-semibold text-zinc-900">Datos demo</p>
      <p className="mt-1 text-sm text-zinc-600">
        Carga propiedades, imágenes y leads de ejemplo para una demo comercial.
      </p>
      <p className="mt-1 text-xs text-amber-700">
        {isProduction
          ? "Deshabilitado en producción."
          : "Disponible solo en desarrollo. No usar en producción."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            if (isProduction) return
            startTransition(async () => {
              const actionResult = await loadDemoDataAction()
              setResult(actionResult)
              router.refresh()
            })
          }}
          disabled={isPending || isProduction}
        >
          {isProduction
            ? "Carga demo deshabilitada"
            : isPending
              ? "Cargando datos demo..."
              : "Cargar datos demo"}
        </Button>
      </div>

      {result ? (
        <p
          className={`mt-4 rounded-lg border p-3 text-sm ${
            result.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {result.message}
          {result.success && result.summary
            ? ` Propiedades: ${result.summary.propertiesProcessed}, imágenes: ${result.summary.imagesProcessed}, leads nuevos: ${result.summary.leadsCreated}, admin creado: ${result.summary.adminCreated ? "sí" : "no"}.`
            : ""}
        </p>
      ) : null}
    </div>
  )
}
