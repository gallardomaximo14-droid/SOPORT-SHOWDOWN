import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest) {
  try {
    const { hostId, hostName } = await request.json()

    if (!hostId || !hostName) {
      return NextResponse.json({ error: "Host ID y nombre son requeridos" }, { status: 400 })
    }

    const room = gameStore.createRoom(hostId, hostName)

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
    return NextResponse.json({ error: "Error al crear la sala" }, { status: 500 })
  }
}
