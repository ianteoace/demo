import type { HTMLAttributes } from "react"

import { cn } from "@/lib/cn"

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "wide" | "public"
}

export default function Container({ size = "default", className, ...props }: ContainerProps) {
  const sizeClass =
    size === "wide"
      ? "max-w-[124rem]"
      : size === "public"
        ? "max-w-[128rem]"
        : "max-w-[110rem]"

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12",
        sizeClass,
        className,
      )}
      {...props}
    />
  )
}
