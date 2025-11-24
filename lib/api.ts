export type Obj = {
  _id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
}

let cachedBase: string | null = null
const TIMEOUT_MS = 2000

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

export async function listObjects(): Promise<Obj[]> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects")
  if (!r.ok) throw new Error("Failed to list objects")
  return r.json()
}

export async function getObject(id: string): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/" + id)
  if (r.status === 404) throw new Error("404")
  if (!r.ok) throw new Error("Failed to get object")
  return r.json()
}

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

export async function deleteObject(id: string): Promise<Obj> {
  const base = await getApiBase()
  const r = await fetch(base + "/objects/" + id, { method: "DELETE" })
  if (r.status === 404) throw new Error("404")
  if (!r.ok) throw new Error("Failed to delete object")
  return r.json()
}