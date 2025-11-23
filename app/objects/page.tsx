"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { listObjects, deleteObject, Obj } from "@/lib/api"
import { getSocket } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"
import type { Socket } from "socket.io-client"

export default function ObjectsPage() {
  const [items, setItems] = useState<Obj[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  async function initialLoad() {
    try {
      setLoading(true)
      const data = await listObjects()
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setItems(sorted)
      setError(null)
    } catch (e) {
      setError("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initialLoad()
  }, [])

  useEffect(() => {
    let mounted = true
    function onCreated(data: Obj) {
      if (!mounted) return
      setItems(prev => [data, ...(prev ?? [])])
    }
    function onDeleted(payload: { id: string }) {
      if (!mounted) return
      setItems(prev => (prev ?? []).filter(i => i._id !== payload.id))
    }
    getSocket().then(s => {
      socketRef.current = s
      s.on("objects.created", onCreated)
      s.on("objects.deleted", onDeleted)
    })
    return () => {
      mounted = false
      const s = socketRef.current
      if (s) {
        s.off("objects.created")
        s.off("objects.deleted")
      }
    }
  }, [])

  async function onDelete(id: string) {
    try {
      setDeleting(id)
      await deleteObject(id)
      setItems(prev => (prev ?? []).filter(i => i._id !== id))
    } catch (e) {
      setError("Failed to delete")
    }
    setDeleting(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Objects</h1>
        <Link href="/objects/new" aria-label="Create new object" className="inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-white hover:bg-neutral-800">New</Link>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-neutral-600"><Spinner /> Loading</div>
      )}
      {error && (
        <div className="text-red-600">{error}</div>
      )}
      {!loading && items && items.length === 0 && (
        <div className="text-neutral-600">No objects</div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items?.map(it => (
          <Card key={it._id}>
            <CardHeader>
              <CardTitle>{it.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm text-neutral-700">{it.description}</div>
              <div className="relative h-40 w-full overflow-hidden rounded-md border">
                <Image src={it.imageUrl} alt={it.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="mt-2 text-xs text-neutral-500">{new Date(it.createdAt).toLocaleString()}</div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Link href={`/objects/${it._id}`} aria-label="View object" className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 px-4 hover:bg-neutral-100">View</Link>
              <Button onClick={() => onDelete(it._id)} variant="destructive" disabled={deleting === it._id}>{deleting === it._id ? "Deleting..." : "Delete"}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}