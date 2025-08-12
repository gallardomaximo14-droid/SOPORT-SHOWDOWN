import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest) {
  try {
    const { code, playerId, playerName } = await request.json()

    if (!code || !playerId || !playerName) {
      return NextResponse.json({ error: "Código, ID de jugador y nombre son requeridos" }, { status: 400 })
    }

    const room = gameStore.joinRoom(code, playerId, playerName)

    if (!room) {
      return NextResponse.json({ error: "Sala no encontrada o juego ya iniciado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        players: room.players,
        gameState: room.gameState,
        settings: room.settings,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al unirse a la sala" }, { status: 500 })
  }
}
