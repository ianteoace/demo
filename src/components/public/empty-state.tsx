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
    <section className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500">
        i
      </div>
      <h3 className="text-xl font-semibold text-zinc-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-zinc-600">{description}</p>
      {note ? <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">{note}</p> : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  )
}
