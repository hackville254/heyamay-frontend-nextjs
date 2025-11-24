import { forwardRef, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black", className)} {...props} />
})