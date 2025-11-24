// Type definition for a single object returned by the API
export type Obj = {
  _id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
}

// Cache for the discovered API base URL to avoid repeated probing
let cachedBase: string | null = null
// Timeout for each health-check request when probing potential API bases
const TIMEOUT_MS = 2000

// Attempts to reach the API at the given URL by calling /objects endpoint
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

// Resolves and caches the correct API base URL
// Priority: cached value > NEXT_PUBLIC_API_BASE env var > localhost probe
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
  const b = await tryBase("http://localhost:3000")
  cachedBase = b ?? "http://localhost:3000"
  return cachedBase
}

// Fetches the list of all objects from the API
export async function listObjects(): Promise<Obj[]> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects")
  if (!r.ok) throw new Error("Failed to list objects")
  return r.json()
}

// Retrieves a single object by its ID
export async function getObject(id: string): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/" + id)
  if (r.status === 404) throw new Error("404")
  if (!r.ok) throw new Error("Failed to get object")
  return r.json()
}

// Requests a pre-signed upload URL for direct file upload to storage
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

// Creates a new object with the provided metadata
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

// Deletes an object by its ID and returns the deleted object
export async function deleteObject(id: string): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/" + id, { method: "DELETE" })
  if (r.status === 404) throw new Error("404")
  if (!r.ok) throw new Error("Failed to delete object")
  return r.json()
}