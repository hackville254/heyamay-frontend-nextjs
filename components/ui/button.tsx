import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "destructive" }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ className, variant = "default", ...props }, ref) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2"
  const variants = {
    default: "bg-black text-white hover:bg-neutral-800",
    outline: "border border-neutral-300 hover:bg-neutral-100",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  }
  return <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
})