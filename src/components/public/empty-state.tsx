import Link from "next/link"

type EmptyStateProps = {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  note?: string
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  note,
}: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-soft)] p-8 text-center">
      <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]">
        i
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-[var(--color-muted)]">{description}</p>
      {note ? <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-muted)]">{note}</p> : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  )
}
