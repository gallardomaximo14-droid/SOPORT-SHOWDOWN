"use client"

import { Badge } from "@/components/ui/badge"

interface ConnectionStatusProps {
  isConnected: boolean
  connectionError: string | null
  lastUpdate: number
}

export function ConnectionStatus({ isConnected, connectionError, lastUpdate }: ConnectionStatusProps) {
  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return "Nunca"
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  if (connectionError) {
    return (
      <Badge variant="destructive" className="font-mono">
        ❌ Error: {connectionError}
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={isConnected ? "default" : "secondary"}
        className={`font-mono ${isConnected ? "bg-emerald-600" : "bg-slate-600"}`}
      >
        {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
      </Badge>
      {lastUpdate > 0 && (
        <Badge variant="outline" className="font-mono text-xs">
          Actualizado: {getTimeSinceUpdate()}
        </Badge>
      )}
    </div>
  )
}
