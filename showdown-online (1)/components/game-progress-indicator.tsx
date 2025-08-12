"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { GameRoom } from "@/lib/types"

interface GameProgressProps {
  room: GameRoom
}

export function GameProgressIndicator({ room }: GameProgressProps) {
  if (room.gameState !== "playing") return null

  const progress = ((room.currentQuestion + 1) / room.questions.length) * 100
  const remainingQuestions = room.questions.length - room.currentQuestion - 1

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-400/30">
      <div className="flex justify-between items-center mb-2">
        <span className="text-cyan-400 font-mono text-sm">Progreso del Juego</span>
        <Badge variant="outline" className="border-cyan-400/60 text-cyan-400 font-mono text-xs">
          {remainingQuestions} restantes
        </Badge>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-center mt-2">
        <span className="text-slate-400 font-mono text-xs">
          Pregunta {room.currentQuestion + 1} de {room.questions.length}
        </span>
      </div>
    </div>
  )
}
