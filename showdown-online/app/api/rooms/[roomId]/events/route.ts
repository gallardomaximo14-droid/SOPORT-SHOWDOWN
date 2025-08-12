import type { NextRequest } from "next/server"
import { gameStore } from "@/lib/game-store"

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get("playerId")

  if (!playerId) {
    return new Response("Player ID required", { status: 400 })
  }

  // Configurar Server-Sent Events
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Función para enviar eventos
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Enviar evento inicial
      const room = gameStore.getRoom(params.roomId)
      if (room) {
        sendEvent("room-update", {
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
      }

      // Polling para cambios (cada 1 segundo para SSE)
      const interval = setInterval(() => {
        const currentRoom = gameStore.getRoom(params.roomId)

        if (!currentRoom) {
          sendEvent("room-closed", { message: "Sala cerrada" })
          controller.close()
          return
        }

        // Verificar si el jugador sigue en la sala
        const player = currentRoom.players.find((p) => p.id === playerId)
        if (!player) {
          sendEvent("player-removed", { message: "Removido de la sala" })
          controller.close()
          return
        }

        // Enviar actualización del estado
        sendEvent("room-update", {
          room: {
            id: currentRoom.id,
            code: currentRoom.code,
            players: currentRoom.players,
            gameState: currentRoom.gameState,
            currentQuestion: currentRoom.currentQuestion,
            questions: currentRoom.questions,
            settings: currentRoom.settings,
          },
        })
      }, 1000)

      // Limpiar al cerrar
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
