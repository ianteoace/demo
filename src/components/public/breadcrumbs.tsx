import Link from "next/link"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-zinc-900">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-zinc-700" : undefined}>{item.label}</span>
              )}
              {!isLast ? <span className="text-zinc-400">/</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
