// REST helpers for the Objects API
// - Detects API base URL with a short timeout and caches it
// - Provides CRUD operations and presigned S3 upload URL generation
export type Obj = {
  _id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
}

let cachedBase: string | null = null
const TIMEOUT_MS = 2000

// Probe an API base by calling GET /objects with a timeout
async function tryBase(url: string) {
  try {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), TIMEOUT_MS)
    const r = await fetch(url + "/objects", { method: "GET", signal: c.signal })
    clearTimeout(t)
    if (r.ok) return url
  } catch {}
  return null
}

// Resolve the API base URL, preferring env override then probing localhost ports
export async function getApiBase() {
  if (cachedBase) return cachedBase
  const envBase = process.env.NEXT_PUBLIC_API_BASE
  if (envBase) {
    cachedBase = envBase
    return cachedBase
  }
  const a = await tryBase("http://localhost:3000")
  if (a) {
    cachedBase = a
    return cachedBase
  }
  const b = await tryBase("http://localhost:3001")
  cachedBase = b ?? "http://localhost:3000"
  return cachedBase
}

// List all objects
export async function listObjects(): Promise<Obj[]> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects")
  if (!r.ok) throw new Error("Failed to list objects")
  return r.json()
}

// Get a single object by id
export async function getObject(id: string): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/" + id)
  if (r.status === 404) throw new Error("404")
  if (!r.ok) throw new Error("Failed to get object")
  return r.json()
}

// Request a presigned upload URL for S3/MinIO
export async function getUploadUrl(filename: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType })
  })
  if (!r.ok) throw new Error("Failed to get upload URL")
  return r.json()
}

// Create a new object document after successful upload
export async function createObject(input: { title: string; description: string; imageUrl: string }): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  })
  if (!r.ok) throw new Error("Failed to create object")
  return r.json()
}

// Delete an object (and its image on S3 handled by the API)
export async function deleteObject(id: string): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/" + id, { method: "DELETE" })
  if (r.status === 404) throw new Error("404")
  if (!r.ok) throw new Error("Failed to delete object")
  return r.json()
}