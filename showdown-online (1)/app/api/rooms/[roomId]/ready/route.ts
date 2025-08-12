import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { playerId, isReady } = await request.json()

    if (!playerId || typeof isReady !== "boolean") {
      return NextResponse.json({ error: "Player ID y estado ready son requeridos" }, { status: 400 })
    }

    const success = gameStore.updatePlayerReady(params.roomId, playerId, isReady)

    if (!success) {
      return NextResponse.json({ error: "No se pudo actualizar el estado del jugador" }, { status: 404 })
    }

    const room = gameStore.getRoom(params.roomId)

    return NextResponse.json({
      success: true,
      room: {
        id: room!.id,
        code: room!.code,
        players: room!.players,
        gameState: room!.gameState,
        settings: room!.settings,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar estado del jugador" }, { status: 500 })
  }
}
