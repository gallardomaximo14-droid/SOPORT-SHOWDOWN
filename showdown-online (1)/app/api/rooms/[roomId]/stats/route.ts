import { type NextRequest, NextResponse } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const stats = gameStore.getRoomStats(params.roomId)

    if (!stats) {
      return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
