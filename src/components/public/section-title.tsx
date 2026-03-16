import Link from "next/link"

type SectionTitleProps = {
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
}

export default function SectionTitle({
  title,
  subtitle,
  actionLabel,
  actionHref,
}: SectionTitleProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-sm text-zinc-600 md:text-base">{subtitle}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
