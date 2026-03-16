"use client"

import { useActionState } from "react"

import { getOperationTypeLabel, OPERATION_TYPE_VALUES } from "@/lib/property-operation-type"
import { CURRENCY_VALUES, getCurrencyLabel } from "@/lib/property-price"
import { getPropertyTypeLabel, PROPERTY_TYPE_VALUES } from "@/lib/property-type"
import { Button, Card, Input, Select, Textarea } from "@/components/ui"
import {
  EMPTY_PROPERTY_ACTION_STATE,
  type PropertyActionState,
  type PropertyFormValues,
} from "@/types/property"

type PropertyFormProps = {
  initialValues: PropertyFormValues
  submitLabel: string
  title: string
  action: (
    prevState: PropertyActionState,
    formData: FormData,
  ) => Promise<PropertyActionState>
}

function FieldLabel({ children }: { children: string }) {
  return <span className="text-sm font-medium text-zinc-700">{children}</span>
}

export default function PropertyForm({
  initialValues,
  submitLabel,
  title,
  action,
}: PropertyFormProps) {
  const [state, formAction, isPending] = useActionState(action, EMPTY_PROPERTY_ACTION_STATE)

  return (
    <main className="py-8 md:py-10">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            Completa la información comercial y publícala cuando esté lista para el portal.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Los campos obligatorios se validan antes de guardar.
          </p>
        </div>

        <form action={formAction} className="grid gap-6">
          {isPending ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
              Guardando cambios, por favor espera...
            </p>
          ) : null}

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Información principal</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1.5">
                <FieldLabel>Título</FieldLabel>
                <Input
                  name="title"
                  type="text"
                  placeholder="Título"
                  defaultValue={initialValues.title}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Descripción</FieldLabel>
                <Textarea
                  name="description"
                  placeholder="Descripción"
                  defaultValue={initialValues.description}
                  rows={6}
                />
              </label>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Datos comerciales</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 md:col-span-2">
                <FieldLabel>Precio</FieldLabel>
                <Input
                  name="price"
                  type="number"
                  placeholder="Precio"
                  defaultValue={initialValues.price}
                  min="0"
                  step="1"
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Moneda</FieldLabel>
                <Select name="currency" defaultValue={initialValues.currency}>
                  {CURRENCY_VALUES.map((currency) => (
                    <option key={currency} value={currency}>
                      {getCurrencyLabel(currency)}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Tipo de propiedad</FieldLabel>
                <Select name="propertyType" defaultValue={initialValues.propertyType}>
                  {PROPERTY_TYPE_VALUES.map((propertyType) => (
                    <option key={propertyType} value={propertyType}>
                      {getPropertyTypeLabel(propertyType)}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Tipo de operación</FieldLabel>
                <Select name="operationType" defaultValue={initialValues.operationType}>
                  {OPERATION_TYPE_VALUES.map((operationType) => (
                    <option key={operationType} value={operationType}>
                      {getOperationTypeLabel(operationType)}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Ciudad</FieldLabel>
                <Input
                  name="city"
                  type="text"
                  placeholder="Ciudad"
                  defaultValue={initialValues.city}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Dirección</FieldLabel>
                <Input
                  name="address"
                  type="text"
                  placeholder="Dirección"
                  defaultValue={initialValues.address}
                  required
                />
              </label>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Caracteristicas</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1.5">
                <FieldLabel>Ambientes</FieldLabel>
                <Input
                  name="rooms"
                  type="number"
                  placeholder="Ambientes"
                  defaultValue={initialValues.rooms}
                  min="0"
                  step="1"
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Dormitorios</FieldLabel>
                <Input
                  name="bedrooms"
                  type="number"
                  placeholder="Dormitorios"
                  defaultValue={initialValues.bedrooms}
                  min="0"
                  step="1"
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Baños</FieldLabel>
                <Input
                  name="bathrooms"
                  type="number"
                  placeholder="Baños"
                  defaultValue={initialValues.bathrooms}
                  min="0"
                  step="1"
                />
              </label>

              <label className="grid gap-1.5">
                <FieldLabel>Superficie (m²)</FieldLabel>
                <Input
                  name="areaM2"
                  type="number"
                  placeholder="Superficie"
                  defaultValue={initialValues.areaM2}
                  min="0"
                  step="1"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
                <input
                  name="garage"
                  type="checkbox"
                  defaultChecked={initialValues.garage}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                Cochera
              </label>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Estado de publicación</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={initialValues.published}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                Publicada
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-700">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={initialValues.featured}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                Destacada
              </label>
            </div>
          </Card>

          {state.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
