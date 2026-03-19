import { cn } from "@/lib/cn"
import { getRemainingItemsForMinimum, hasReachedWholesaleMinimum, WHOLESALE_MINIMUM_ITEMS } from "@/lib/wholesale-order"

type WholesaleMinimumStatusProps = {
  totalItems: number
  className?: string
}

export default function WholesaleMinimumStatus({ totalItems, className }: WholesaleMinimumStatusProps) {
  const minimumReached = hasReachedWholesaleMinimum(totalItems)
  const remainingItems = getRemainingItemsForMinimum(totalItems)
  const progress = Math.min(100, Math.round((totalItems / WHOLESALE_MINIMUM_ITEMS) * 100))

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        minimumReached
          ? "border-[var(--color-success)]/45 bg-[rgba(22,128,59,0.18)]"
          : "border-[var(--color-primary)]/40 bg-[rgba(225,6,0,0.14)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn("text-sm font-semibold", minimumReached ? "text-[var(--color-text)]" : "text-[var(--color-text)]")}>
          Minimo mayorista: {WHOLESALE_MINIMUM_ITEMS} unidades combinables
        </p>
        <p className={cn("text-xs font-semibold", minimumReached ? "text-[var(--color-text)]" : "text-[var(--color-text)]")}>
          {totalItems} / {WHOLESALE_MINIMUM_ITEMS} unidades
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface)]/80">
        <div
          className={cn("h-full rounded-full transition-all", minimumReached ? "bg-[var(--color-success)]" : "bg-[var(--color-primary)]")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={cn("mt-2 text-sm", minimumReached ? "text-[var(--color-text)]" : "text-[var(--color-text)]")}>
        {minimumReached
          ? "Listo: ya alcanzaste el minimo para confirmar el pedido."
          : `Te faltan ${remainingItems} unidades para habilitar checkout.`}
      </p>
    </div>
  )
}
