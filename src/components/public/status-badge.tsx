type StatusBadgeProps = {
  children: string
  tone?: "default" | "featured" | "success"
}

const toneClassMap: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  featured: "bg-amber-50 text-amber-800 ring-amber-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
}

export default function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneClassMap[tone]}`}
    >
      {children}
    </span>
  )
}
