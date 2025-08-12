import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json({ error: "Player ID es requerido" }, { status: 400 })
    }

    const success = gameStore.removePlayer(params.roomId, playerId)

    if (!success) {
      return NextResponse.json({ error: "No se pudo remover el jugador" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Jugador removido exitosamente",
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al abandonar la sala" }, { status: 500 })
  }
}
