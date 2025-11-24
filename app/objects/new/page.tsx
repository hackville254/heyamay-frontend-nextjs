"use client"
// New Object Page
// Upload flow in 3 steps: presign → PUT to S3/MinIO → POST /objects with publicUrl
import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getUploadUrl, createObject } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function NewObjectPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!file) {
      setError("Select an image")
      return
    }
    setSubmitting(true)
    try {
      const presign = await getUploadUrl(file.name, file.type || "image/png")
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/png" },
        body: file
      })
      if (!put.ok) throw new Error("Upload failed")
      const created = await createObject({ title, description, imageUrl: presign.publicUrl })
      router.push(`/objects/${created._id}`)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>New Object</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] ?? null)} />
              {file && <div className="text-sm text-neutral-600">{file.name}</div>}
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <CardFooter>
              <Button type="submit" disabled={submitting}>{submitting ? "Uploading..." : "Create"}</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}