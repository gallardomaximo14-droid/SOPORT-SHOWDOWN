"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SimpleOnlineModeProps {
  onStartGame: (isOnline: boolean, roomData?: any) => void
}

export default function SimpleOnlineMode({ onStartGame }: SimpleOnlineModeProps) {
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const createRoom = async () => {
    if (!playerName.trim()) {
      setError("Ingresa tu nombre")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", playerName }),
      })

      const data = await response.json()

      if (data.success) {
        onStartGame(true, { roomId: data.roomId, playerName, isHost: true })
      } else {
        setError(data.error || "Error al crear sala")
      }
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError("Ingresa tu nombre y código de sala")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", roomId: roomCode.toUpperCase(), playerName }),
      })

      const data = await response.json()

      if (data.success) {
        onStartGame(true, { roomId: roomCode.toUpperCase(), playerName, isHost: false })
      } else {
        setError(data.error || "Error al unirse a sala")
      }
    } catch (err) {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-green-400">
        <CardHeader>
          <CardTitle className="text-center text-green-400">Modo Online</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="bg-black border-green-400 text-green-400"
          />

          <Button onClick={createRoom} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Creando..." : "Crear Sala"}
          </Button>

          <div className="text-center text-gray-400">o</div>

          <Input
            placeholder="Código de sala"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="bg-black border-green-400 text-green-400"
          />

          <Button onClick={joinRoom} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "Uniéndose..." : "Unirse a Sala"}
          </Button>

          <Button
            onClick={() => onStartGame(false)}
            variant="outline"
            className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
          >
            Jugar Solo
          </Button>

          {error && <div className="text-red-400 text-center text-sm">{error}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
