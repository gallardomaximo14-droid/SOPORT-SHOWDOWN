import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"
import { getBalancedQuestions } from "@/lib/game-data"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { hostId, questionCount = 10 } = await request.json()

    const room = gameStore.getRoom(params.roomId)

    if (!room) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 })
    }

    if (room.hostId !== hostId) {
      return NextResponse.json({ error: "Solo el host puede iniciar el juego" }, { status: 403 })
    }

    if (room.gameState !== "waiting") {
      return NextResponse.json({ error: "El juego ya ha iniciado" }, { status: 400 })
    }

    // Verificar que todos los jugadores estén listos
    const allReady = room.players.every((p) => p.isReady)
    if (!allReady) {
      return NextResponse.json({ error: "No todos los jugadores están listos" }, { status: 400 })
    }

    const selectedQuestions = getBalancedQuestions(questionCount)

    const success = gameStore.startGame(params.roomId, selectedQuestions)

    if (!success) {
      return NextResponse.json({ error: "No se pudo iniciar el juego" }, { status: 500 })
    }

    const updatedRoom = gameStore.getRoom(params.roomId)

    return NextResponse.json({
      success: true,
      room: {
        id: updatedRoom!.id,
        code: updatedRoom!.code,
        players: updatedRoom!.players,
        gameState: updatedRoom!.gameState,
        currentQuestion: updatedRoom!.currentQuestion,
        questions: updatedRoom!.questions,
        settings: updatedRoom!.settings,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al iniciar el juego" }, { status: 500 })
  }
}
