"use client"
// Object Detail Page
// - params is async in React 19 / Next 16; we use React.use() to unwrap
// - loads the object over HTTP and shows an optimized image
import { useEffect, useState, use as usePromise } from "react"
import { Obj, getObject } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

export default function ObjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params)
  const [item, setItem] = useState<Obj | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    if (!id) {
      setError("Not found")
      setLoading(false)
      return
    }
    getObject(id)
      .then(o => {
        if (mounted) setItem(o)
        setError(null)
      })
      .catch(e => {
        setError(e?.message === "404" ? "Not found" : "Failed to load")
      })
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <div className="mx-auto max-w-3xl px-6 py-10">Loading</div>
  if (error) return <div className="mx-auto max-w-3xl px-6 py-10 text-red-600">{error}</div>
  if (!item) return null

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <Link href="/objects" className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 px-4 hover:bg-neutral-100">Back</Link>
      </div>
      <div className="mb-4 text-neutral-700">{item.description}</div>
      <div className="relative h-96 w-full overflow-hidden rounded-md border">
        <Image src={item.imageUrl} alt={item.title} fill sizes="100vw" className="object-cover" />
      </div>
      <div className="mt-4 text-sm text-neutral-500">{new Date(item.createdAt).toLocaleString()}</div>
    </div>
  )
}