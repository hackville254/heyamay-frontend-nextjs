"use client"
// Socket.IO client for the "/objects" namespace
// - WebSocket transport only, short timeout, no auto-reconnection
import { io, Socket } from "socket.io-client"
import { getApiBase } from "@/lib/api"

let socketPromise: Promise<Socket> | null = null

export function getSocket() {
  if (!socketPromise) {
    socketPromise = (async () => {
      const base = await getApiBase()
      const url = base.endsWith("/") ? base + "objects" : base + "/objects"
      const s = io(url, { transports: ["websocket"], autoConnect: true, timeout: 2000, reconnection: false })
      return s
    })()
  }
  return socketPromise
}

export function resetSocket() {
  socketPromise = null
}