import { cn } from "cn"
import Link from "next/link"
import type { ComponentProps } from "react"
import { LucideArrowLeft } from "./icons"

export function PageTitle(props: ComponentProps<"h1">) {
  return <h2 {...props} className={cn(
    "font-medium tracking-tight text-xl frow",
    props.className
  )} />
}

export function BackButton(props: {
  href: string
}) {
  return (
    <Link href={props.href} className="button-ghost border-none items-center -ml-2 -mt-2" >
      <LucideArrowLeft className="" />
      Back
    </Link>
  )
}