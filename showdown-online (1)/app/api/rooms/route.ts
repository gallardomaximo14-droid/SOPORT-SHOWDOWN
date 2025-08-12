// API simple para crear y unirse a salas sin dependencias complejas
const rooms = new Map<
  string,
  {
    id: string
    players: Array<{ id: string; name: string; score: number; ready: boolean }>
    status: "waiting" | "playing" | "finished"
    currentQuestion: number
    createdAt: number
    totalRounds: number
  }
>()

// Limpiar salas viejas cada 30 minutos
setInterval(
  () => {
    const now = Date.now()
    for (const [roomId, room] of rooms.entries()) {
      if (now - room.createdAt > 30 * 60 * 1000) {
        // 30 minutos
        rooms.delete(roomId)
      }
    }
  },
  30 * 60 * 1000,
)

export async function POST(request: Request) {
  try {
    const { action, roomId, playerName, totalRounds } = await request.json()

    if (action === "create") {
      if (!playerName?.trim()) {
        return Response.json({ success: false, error: "Nombre requerido" })
      }

      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
      const playerId = Date.now().toString()

      rooms.set(newRoomId, {
        id: newRoomId,
        players: [
          {
            id: playerId,
            name: playerName.trim(),
            score: 0,
            ready: false,
          },
        ],
        status: "waiting",
        currentQuestion: 0,
        createdAt: Date.now(),
        totalRounds: totalRounds || 5,
      })

      return Response.json({
        success: true,
        roomId: newRoomId,
        playerId: playerId,
      })
    }

    if (action === "join") {
      if (!playerName?.trim() || !roomId?.trim()) {
        return Response.json({ success: false, error: "Nombre y código de sala requeridos" })
      }

      const room = rooms.get(roomId.toUpperCase())
      if (!room) {
        return Response.json({ success: false, error: "Sala no encontrada" })
      }

      if (room.status !== "waiting") {
        return Response.json({ success: false, error: "La sala ya está en juego" })
      }

      if (room.players.length >= 8) {
        return Response.json({ success: false, error: "Sala llena (máximo 8 jugadores)" })
      }

      const playerId = Date.now().toString()
      room.players.push({
        id: playerId,
        name: playerName.trim(),
        score: 0,
        ready: false,
      })

      return Response.json({
        success: true,
        room: room,
        playerId: playerId,
      })
    }

    if (action === "get") {
      const room = rooms.get(roomId?.toUpperCase())
      return Response.json({
        success: !!room,
        room: room || null,
      })
    }

    if (action === "ready") {
      const room = rooms.get(roomId?.toUpperCase())
      if (!room) {
        return Response.json({ success: false, error: "Sala no encontrada" })
      }

      const player = room.players.find((p) => p.id === request.headers.get("player-id"))
      if (player) {
        player.ready = !player.ready
      }

      return Response.json({ success: true, room })
    }

    return Response.json({ success: false, error: "Acción no válida" })
  } catch (error) {
    console.error("Error en API:", error)
    return Response.json({ success: false, error: "Error del servidor" })
  }
}
