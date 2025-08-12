"use client"

import { useState, useEffect, useCallback } from "react"
import type { GameRoom } from "./types"

export function useOnlineGame() {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)
  const [playerId, setPlayerId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generar ID único para el jugador
  useEffect(() => {
    if (!playerId) {
      setPlayerId(`player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    }
  }, [playerId])

  // Crear sala
  const createRoom = useCallback(
    async (hostName: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/rooms/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostId: playerId, hostName }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoom(data.room)
          return data.room
        } else {
          setError(data.error)
          return null
        }
      } catch (err) {
        setError("Error al crear la sala")
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
      setError(null)

      try {
        const response = await fetch("/api/rooms/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, playerId, playerName }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoom(data.room)
          return data.room
        } else {
          setError(data.error)
          return null
        }
      } catch (err) {
        setError("Error al unirse a la sala")
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
      if (!currentRoom) return false

      try {
        const response = await fetch(`/api/rooms/${currentRoom.id}/ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, isReady }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoom(data.room)
          return true
        }
        return false
      } catch (err) {
        setError("Error al actualizar estado")
        return false
      }
    },
    [currentRoom, playerId],
  )

  // Iniciar juego
  const startGame = useCallback(
    async (questionCount = 10) => {
      if (!currentRoom) return false

      try {
        const response = await fetch(`/api/rooms/${currentRoom.id}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostId: playerId, questionCount }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoom(data.room)
          return true
        } else {
          setError(data.error)
          return false
        }
      } catch (err) {
        setError("Error al iniciar el juego")
        return false
      }
    },
    [currentRoom, playerId],
  )

  // Enviar respuesta
  const submitAnswer = useCallback(
    async (questionId: number, answer: number, timeSpent: number) => {
      if (!currentRoom) return false

      try {
        const response = await fetch(`/api/rooms/${currentRoom.id}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId, questionId, answer, timeSpent }),
        })

        const data = await response.json()

        if (data.success) {
          setCurrentRoom(data.room)
          return true
        }
        return false
      } catch (err) {
        setError("Error al enviar respuesta")
        return false
      }
    },
    [currentRoom, playerId],
  )

  // Abandonar sala
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return

    try {
      await fetch(`/api/rooms/${currentRoom.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      })

      setCurrentRoom(null)
    } catch (err) {
      setError("Error al abandonar la sala")
    }
  }, [currentRoom, playerId])

  // Actualizar estado de la sala (polling)
  const refreshRoom = useCallback(async () => {
    if (!currentRoom) return

    try {
      const response = await fetch(`/api/rooms/${currentRoom.id}`)
      const data = await response.json()

      if (data.success) {
        setCurrentRoom(data.room)
      }
    } catch (err) {
      // Silencioso para polling
    }
  }, [currentRoom])

  // Polling automático cada 2 segundos
  useEffect(() => {
    if (!currentRoom) return

    const interval = setInterval(refreshRoom, 2000)
    return () => clearInterval(interval)
  }, [currentRoom, refreshRoom])

  return {
    currentRoom,
    playerId,
    isLoading,
    error,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    submitAnswer,
    leaveRoom,
    refreshRoom,
    clearError: () => setError(null),
  }
}
