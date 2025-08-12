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
      return NextResponse.json({ error: "Solo el host puede avanzar preguntas" }, { status: 403 })
    }

    if (room.gameState !== "playing") {
      return NextResponse.json({ error: "El juego no está en progreso" }, { status: 400 })
    }

    // Avanzar a la siguiente pregunta o terminar el juego
    if (room.currentQuestion < room.questions.length - 1) {
      room.currentQuestion++
    } else {
      room.gameState = "finished"
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        players: room.players,
        gameState: room.gameState,
        currentQuestion: room.currentQuestion,
        questions: room.questions,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al avanzar pregunta" }, { status: 500 })
  }
}
