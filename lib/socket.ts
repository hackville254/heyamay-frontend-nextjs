"use client"
import { io, Socket } from "socket.io-client"
import { getApiBase } from "@/lib/api"

// Singleton promise that holds the active Socket.IO connection
let socketPromise: Promise<Socket> | null = null

/**
 * Returns a singleton Socket.IO client connected to the /objects namespace.
 * The connection is established lazily on the first call and reused thereafter.
 */
export function getSocket() {
  if (!socketPromise) {
    socketPromise = (async () => {
      // Build the full WebSocket URL pointing to the /objects namespace
      const base = await getApiBase()
      const url = base.endsWith("/") ? base + "objects" : base + "/objects"

      // Create the socket with WebSocket-only transport, no automatic reconnection,
      // a 2-second connection timeout, and immediate connection attempt
      const s = io(url, { transports: ["websocket"], autoConnect: true, timeout: 2000, reconnection: false })
      return s
    })()
  }
  return socketPromise
}

/**
 * Resets the singleton socket promise so the next call to getSocket()
 * will create a brand-new connection.
 */
export function resetSocket() {
  socketPromise = null
}