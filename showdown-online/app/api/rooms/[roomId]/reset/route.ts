import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { hostId } = await request.json()

    const room = gameStore.getRoom(params.roomId)

    if (!room) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 })
    }

    if (room.hostId !== hostId) {
      return NextResponse.json({ error: "Solo el host puede reiniciar el juego" }, { status: 403 })
    }

    const success = gameStore.resetGame(params.roomId)

    if (!success) {
      return NextResponse.json({ error: "No se pudo reiniciar el juego" }, { status: 500 })
    }

    const updatedRoom = gameStore.getRoom(params.roomId)

    return NextResponse.json({
      success: true,
      room: {
        id: updatedRoom!.id,
        code: updatedRoom!.code,
        players: updatedRoom!.players,
        gameState: updatedRoom!.gameState,
        settings: updatedRoom!.settings,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al reiniciar el juego" }, { status: 500 })
  }
}
