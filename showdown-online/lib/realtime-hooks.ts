"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { GameRoom } from "./types"

interface RealtimeGameState {
  room: GameRoom | null
  isConnected: boolean
  connectionError: string | null
  lastUpdate: number
}

export function useRealtimeGame(roomId: string | null, playerId: string) {
  const [state, setState] = useState<RealtimeGameState>({
    room: null,
    isConnected: false,
    connectionError: null,
    lastUpdate: 0,
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)

  // Conectar a SSE
  const connect = useCallback(() => {
    if (!roomId || !playerId) return

    // Cerrar conexión existente
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource(`/api/rooms/${roomId}/events?playerId=${playerId}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionError: null,
        }))
        reconnectAttempts.current = 0
      }

      eventSource.addEventListener("room-update", (event) => {
        try {
          const data = JSON.parse(event.data)
          setState((prev) => ({
            ...prev,
            room: data.room,
            lastUpdate: Date.now(),
          }))
        } catch (error) {
          console.error("Error parsing room update:", error)
        }
      })

      eventSource.addEventListener("room-closed", (event) => {
        setState((prev) => ({
          ...prev,
          room: null,
          connectionError: "La sala ha sido cerrada",
        }))
        eventSource.close()
      })

      eventSource.addEventListener("player-removed", (event) => {
        setState((prev) => ({
          ...prev,
          room: null,
          connectionError: "Has sido removido de la sala",
        }))
        eventSource.close()
      })

      eventSource.onerror = (error) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionError: "Error de conexión",
        }))

        eventSource.close()

        // Reconexión automática con backoff exponencial
        if (reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        connectionError: "No se pudo establecer conexión",
      }))
    }
  }, [roomId, playerId])

  // Desconectar
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      room: null,
    }))
  }, [])

  // Conectar automáticamente cuando cambie roomId
  useEffect(() => {
    if (roomId && playerId) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [roomId, playerId, connect, disconnect])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    room: state.room,
    isConnected: state.isConnected,
    connectionError: state.connectionError,
    lastUpdate: state.lastUpdate,
    reconnect: connect,
    disconnect,
  }
}
