type StatusBadgeProps = {
  children: string
  tone?: "default" | "featured" | "success"
}

const toneClassMap: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  default: "bg-[var(--color-surface-soft)] text-[var(--color-muted)] ring-[var(--color-border)]",
  featured: "bg-[rgba(225,6,0,0.2)] text-[var(--color-text)] ring-[rgba(225,6,0,0.35)]",
  success: "bg-[rgba(22,128,59,0.22)] text-[var(--color-text)] ring-[rgba(22,128,59,0.4)]",
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
