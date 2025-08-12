"use client"

import { useEffect, useState } from "react"
import type { OnlinePlayer } from "@/lib/types"

interface PlayerActivityProps {
  player: OnlinePlayer
}

export function PlayerActivityIndicator({ player }: PlayerActivityProps) {
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const checkActivity = () => {
      const timeSinceActivity = Date.now() - player.lastActivity
      setIsActive(timeSinceActivity < 10000) // Activo si actividad en últimos 10s
    }

    checkActivity()
    const interval = setInterval(checkActivity, 1000)
    return () => clearInterval(interval)
  }, [player.lastActivity])

  return <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
}
