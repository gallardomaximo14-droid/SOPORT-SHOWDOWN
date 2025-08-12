import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"
import type { PlayerAnswer } from "@/lib/types"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { playerId, questionId, answer, timeSpent } = await request.json()

    if (!playerId || questionId === undefined || answer === undefined || !timeSpent) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const playerAnswer: PlayerAnswer = {
      playerId,
      questionId,
      answer,
      timeSpent,
      timestamp: Date.now(),
    }

    const success = gameStore.submitAnswer(params.roomId, playerId, playerAnswer)

    if (!success) {
      return NextResponse.json({ error: "No se pudo registrar la respuesta" }, { status: 404 })
    }

    const room = gameStore.getRoom(params.roomId)

    return NextResponse.json({
      success: true,
      room: {
        id: room!.id,
        players: room!.players,
        gameState: room!.gameState,
        currentQuestion: room!.currentQuestion,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al enviar respuesta" }, { status: 500 })
  }
}
