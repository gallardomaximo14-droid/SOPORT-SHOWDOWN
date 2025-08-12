"use client"

import { useState, useCallback } from "react"
import { useRealtimeGame } from "./realtime-hooks"

export function useEnhancedOnlineGame() {
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Usar comunicación en tiempo real
  const {
    room: currentRoom,
    isConnected,
    connectionError,
    lastUpdate,
    disconnect,
  } = useRealtimeGame(currentRoomId, playerId)

  // Crear sala
  const createRoom = useCallback(
    async (hostName: string) => {
      setIsLoading(true)
      setActionError(null)

      try {
        const response = await fetch("/api/rooms/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostId: playerId, hostName }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoomId(data.room.id)
          return data.room
        } else {
          setActionError(data.error)
          return null
        }
      } catch (err) {
        setActionError("Error al crear la sala")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [playerId],
  )

  // Unirse a sala
  const joinRoom = useCallback(
    async (code: string, playerName: string) => {
      setIsLoading(true)
      setActionError(null)

      try {
        const response = await fetch("/api/rooms/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, playerId, playerName }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoomId(data.room.id)
          return data.room
        } else {
          setActionError(data.error)
          return null
        }
      } catch (err) {
        setActionError("Error al unirse a la sala")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [playerId],
  )

  // Marcar como listo
  const toggleReady = useCallback(
    async (isReady: boolean) => {
      if (!currentRoomId) return false

      try {
        const response = await fetch(`/api/rooms/${currentRoomId}/ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, isReady }),
        })

        const data = await response.json()
        return data.success
      } catch (err) {
        setActionError("Error al actualizar estado")
        return false
      }
    },
    [currentRoomId, playerId],
  )

  // Iniciar juego
  const startGame = useCallback(
    async (questionCount = 10) => {
      if (!currentRoomId) return false

      try {
        const response = await fetch(`/api/rooms/${currentRoomId}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostId: playerId, questionCount }),
        })

        const data = await response.json()

        if (!data.success) {
          setActionError(data.error)
          return false
        }
        return true
      } catch (err) {
        setActionError("Error al iniciar el juego")
        return false
      }
    },
    [currentRoomId, playerId],
  )

  // Enviar respuesta
  const submitAnswer = useCallback(
    async (questionId: number, answer: number, timeSpent: number) => {
      if (!currentRoomId) return false

      try {
        const response = await fetch(`/api/rooms/${currentRoomId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, questionId, answer, timeSpent }),
        })

        const data = await response.json()
        return data.success
      } catch (err) {
        setActionError("Error al enviar respuesta")
        return false
      }
    },
    [currentRoomId, playerId],
  )

  // Abandonar sala
  const leaveRoom = useCallback(async () => {
    if (!currentRoomId) return

    try {
      await fetch(`/api/rooms/${currentRoomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })
    } catch (err) {
      setActionError("Error al abandonar la sala")
    } finally {
      disconnect()
      setCurrentRoomId(null)
    }
  }, [currentRoomId, playerId, disconnect])

  // Nuevo método para reiniciar juego
  const resetGame = useCallback(async () => {
    if (!currentRoomId) return false

    try {
      const response = await fetch(`/api/rooms/${currentRoomId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: playerId }),
      })

      const data = await response.json()

      if (!data.success) {
        setActionError(data.error)
        return false
      }
      return true
    } catch (err) {
      setActionError("Error al reiniciar el juego")
      return false
    }
  }, [currentRoomId, playerId])

  // Nuevo método para obtener estadísticas
  const getRoomStats = useCallback(async () => {
    if (!currentRoomId) return null

    try {
      const response = await fetch(`/api/rooms/${currentRoomId}/stats`)
      const data = await response.json()

      if (data.success) {
        return data.stats
      }
      return null
    } catch (err) {
      return null
    }
  }, [currentRoomId])

  // Obtener jugador actual
  const getCurrentPlayer = useCallback(() => {
    if (!currentRoom) return null
    return currentRoom.players.find((p) => p.id === playerId) || null
  }, [currentRoom, playerId])

  // Verificar si es host
  const isHost = useCallback(() => {
    if (!currentRoom) return false
    return currentRoom.hostId === playerId
  }, [currentRoom, playerId])

  return {
    // Estado
    currentRoom,
    playerId,
    isLoading,
    isConnected,
    actionError,
    connectionError,
    lastUpdate,

    // Acciones
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    submitAnswer,
    leaveRoom,
    resetGame, // Nueva acción
    getRoomStats, // Nueva acción

    // Utilidades
    getCurrentPlayer,
    isHost,
    clearError: () => setActionError(null),
  }
}
