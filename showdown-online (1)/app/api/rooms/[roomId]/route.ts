import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const room = gameStore.getRoom(params.roomId)

    if (!room) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        players: room.players,
        gameState: room.gameState,
        currentQuestion: room.currentQuestion,
        questions: room.questions,
        settings: room.settings,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener la sala" }, { status: 500 })
  }
}
