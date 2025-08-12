"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ConnectionStatus } from "./connection-status"
import { PlayerActivityIndicator } from "./player-activity-indicator"
import { useEnhancedOnlineGame } from "@/lib/enhanced-game-hooks"
import type { OnlinePlayer } from "@/lib/types"

const MatrixRain = () => {
  const [columns, setColumns] = useState<
    Array<{ id: number; left: number; duration: number; delay: number; chars: string }>
  >([])

  useEffect(() => {
    const matrixChars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    const newColumns = []

    for (let i = 0; i < 80; i++) {
      const chars = Array.from({ length: 30 }, () => matrixChars[Math.floor(Math.random() * matrixChars.length)]).join(
        "",
      )

      newColumns.push({
        id: i,
        left: Math.random() * 100,
        duration: 2 + Math.random() * 6,
        delay: Math.random() * 8,
        chars,
      })
    }

    setColumns(newColumns)
  }, [])

  return (
    <div className="matrix-bg">
      {columns.map((column) => (
        <div
          key={column.id}
          className="matrix-column"
          style={{
            left: `${column.left}%`,
            animationDuration: `${column.duration}s`,
            animationDelay: `${column.delay}s`,
            opacity: 0.8,
          }}
        >
          {column.chars}
        </div>
      ))}
    </div>
  )
}

export default function OnlineTriviaGame() {
  const {
    currentRoom,
    playerId,
    isLoading,
    isConnected,
    actionError,
    connectionError,
    lastUpdate,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    submitAnswer,
    leaveRoom,
    resetGame, // Nueva función
    getCurrentPlayer,
    isHost,
    clearError,
  } = useEnhancedOnlineGame()

  // Estados locales para la UI
  const [playerName, setPlayerName] = useState("")
  const [gameMode, setGameMode] = useState<"create" | "join">("create")
  const [joinRoomCode, setJoinRoomCode] = useState("")
  const [totalRounds, setTotalRounds] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0)

  const currentPlayer = getCurrentPlayer()
  const currentQuestion = currentRoom?.questions?.[currentRoom.currentQuestion]

  useEffect(() => {
    if (currentQuestion && currentRoom?.gameState === "playing") {
      const shuffled = [...currentQuestion.options].sort(() => Math.random() - 0.5)
      const correctIndex = shuffled.indexOf(currentQuestion.options[currentQuestion.correct])
      setShuffledOptions(shuffled)
      setCorrectAnswerIndex(correctIndex)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(30)
    }
  }, [currentQuestion, currentRoom?.currentQuestion])

  useEffect(() => {
    if (currentRoom?.gameState === "playing" && timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(-1)
    }
  }, [timeLeft, currentRoom?.gameState, selectedAnswer])

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return
    clearError()
    await createRoom(playerName)
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !joinRoomCode.trim()) return
    clearError()
    await joinRoom(joinRoomCode, playerName)
  }

  const handleToggleReady = async () => {
    if (!currentPlayer) return
    await toggleReady(!currentPlayer.isReady)
  }

  const handleStartGame = async () => {
    if (!isHost()) return
    await startGame(totalRounds)
  }

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return

    setSelectedAnswer(answerIndex.toString())
    setShowResult(true)

    const responseTime = 30 - timeLeft
    await submitAnswer(currentRoom!.currentQuestion, answerIndex, responseTime)

    // Auto avanzar después de mostrar resultado
    setTimeout(() => {
      if (currentRoom && currentRoom.currentQuestion < currentRoom.questions.length - 1) {
        // La siguiente pregunta se manejará automáticamente por SSE
      }
    }, 3000)
  }

  const handleLeaveRoom = async () => {
    await leaveRoom()
    setPlayerName("")
    setJoinRoomCode("")
    setGameMode("create")
  }

  const handleResetGame = async () => {
    if (!isHost()) return
    await resetGame()
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <MatrixRain />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
                SOPORT SHOWDOWN
              </h1>
              <p className="text-slate-300 text-lg font-mono">Modo Online - Demuestra tus conocimientos técnicos</p>
              <Badge variant="outline" className="mt-2 border-emerald-400/60 text-emerald-400 font-mono">
                🌐 Multijugador en Tiempo Real
              </Badge>
            </div>

            {(actionError || connectionError) && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-mono text-center">{actionError || connectionError}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-cyan-400 font-mono mb-2">Nombre del Jugador</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/50 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Ingresa tu nombre"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGameMode("create")}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all font-mono ${
                    gameMode === "create"
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-600 text-slate-400 hover:border-cyan-500"
                  }`}
                >
                  Crear Sala
                </button>
                <button
                  onClick={() => setGameMode("join")}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border-2 transition-all font-mono ${
                    gameMode === "join"
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                      : "border-slate-600 text-slate-400 hover:border-emerald-500"
                  }`}
                >
                  Unirse a Sala
                </button>
              </div>

              {gameMode === "create" && (
                <>
                  <div>
                    <label className="block text-cyan-400 font-mono mb-2">Número de Preguntas (5-20)</label>
                    <input
                      type="number"
                      min="5"
                      max="20"
                      value={totalRounds}
                      onChange={(e) => {
                        const value = Math.min(20, Math.max(5, Number.parseInt(e.target.value) || 5))
                        setTotalRounds(value)
                      }}
                      className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/50 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    disabled={!playerName.trim() || isLoading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg shadow-lg hover:shadow-cyan-500/25"
                  >
                    {isLoading ? "CREANDO..." : "CREAR SALA"}
                  </button>
                </>
              )}

              {gameMode === "join" && (
                <>
                  <div>
                    <label className="block text-emerald-400 font-mono mb-2">Código de Sala</label>
                    <input
                      type="text"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-slate-800 border border-emerald-500/50 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      placeholder="Ingresa el código"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !joinRoomCode.trim() || isLoading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg shadow-lg hover:shadow-emerald-500/25"
                  >
                    {isLoading ? "UNIÉNDOSE..." : "UNIRSE A SALA"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentRoom.gameState === "waiting") {
    const allReady = currentRoom.players.every((p) => p.isReady)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <MatrixRain />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="text-center flex-1">
                <h2 className="text-4xl font-bold text-cyan-400 mb-4 font-mono">SALA ONLINE</h2>
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <p className="text-slate-300 font-mono mb-2">Código de la sala:</p>
                  <p className="text-3xl font-bold text-emerald-400 font-mono tracking-wider">{currentRoom.code}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ConnectionStatus isConnected={isConnected} connectionError={connectionError} lastUpdate={lastUpdate} />
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all font-mono text-sm"
                >
                  Abandonar Sala
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">
                  Jugadores ({currentRoom.players.length})
                </h3>
                <div className="space-y-3">
                  {currentRoom.players.map((player: OnlinePlayer) => (
                    <div key={player.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <PlayerActivityIndicator player={player} />
                        <span className="text-white font-mono">{player.name}</span>
                        {player.id === playerId && <span className="text-cyan-400 text-sm font-mono">(Tú)</span>}
                        {player.isHost && <span className="text-yellow-400 text-sm font-mono">(Host)</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        {player.isReady ? (
                          <Badge className="bg-emerald-600 font-mono text-xs">✓ Listo</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-mono text-xs">
                            Esperando...
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleToggleReady}
                  disabled={!isConnected}
                  className={`flex-1 py-3 rounded-lg font-mono font-bold transition-all ${
                    currentPlayer?.isReady
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  } disabled:opacity-50`}
                >
                  {currentPlayer?.isReady ? "LISTO ✓" : "MARCAR COMO LISTO"}
                </button>

                {isHost() && (
                  <button
                    onClick={handleStartGame}
                    disabled={!allReady || !isConnected || currentRoom.players.length < 1}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono shadow-lg"
                  >
                    {allReady ? "INICIAR JUEGO" : "ESPERANDO JUGADORES"}
                  </button>
                )}
              </div>

              {!isHost() && (
                <p className="text-center text-slate-400 font-mono">Esperando a que el host inicie el juego...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentRoom.gameState === "playing" && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <MatrixRain />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <Card className="w-full bg-slate-950/95 border-2 border-cyan-400/60 backdrop-blur-xl shadow-2xl shadow-cyan-400/20">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Badge variant="outline" className="border-cyan-400/60 text-cyan-400 font-mono">
                    Pregunta {currentRoom.currentQuestion + 1}/{currentRoom.questions.length}
                  </Badge>
                  <Badge variant="outline" className="border-yellow-400/60 text-yellow-400 font-mono">
                    {currentQuestion.difficulty?.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <ConnectionStatus
                    isConnected={isConnected}
                    connectionError={connectionError}
                    lastUpdate={lastUpdate}
                  />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400 font-mono">⏱️ {timeLeft}s</div>
                    <Progress value={(timeLeft / 30) * 100} className="w-24 h-2 mt-1" />
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-400/80 shadow-lg shadow-cyan-400/20">
                <CardContent className="p-6">
                  <CardTitle className="text-2xl font-bold text-cyan-100 mb-4 text-center leading-relaxed">
                    {currentQuestion.question}
                  </CardTitle>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="border-purple-400/60 text-purple-400 font-mono">
                      📚 {currentQuestion.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shuffledOptions.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null || !isConnected}
                    className={`p-6 h-auto text-left justify-start transition-all duration-300 font-mono text-lg ${
                      selectedAnswer === null
                        ? "bg-slate-800/60 border-2 border-cyan-400/60 text-cyan-100 hover:bg-slate-700/80 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30 transform hover:scale-105"
                        : selectedAnswer === index.toString()
                          ? index === correctAnswerIndex
                            ? "bg-gradient-to-r from-emerald-500/80 to-green-500/80 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-400/50 scale-105"
                            : "bg-gradient-to-r from-red-500/80 to-rose-500/80 border-2 border-red-400 text-white shadow-lg shadow-red-400/50 scale-105"
                          : index === correctAnswerIndex
                            ? "bg-gradient-to-r from-emerald-500/60 to-green-500/60 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-400/30"
                            : "bg-slate-800/40 border-2 border-slate-600 text-slate-400"
                    }`}
                  >
                    <span className="font-bold text-xl mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              {showResult && (
                <div className="mt-6 text-center">
                  <div
                    className={`text-2xl font-bold font-mono ${
                      selectedAnswer === correctAnswerIndex.toString() ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {selectedAnswer === correctAnswerIndex.toString() ? "¡CORRECTO! ✅" : "INCORRECTO ❌"}
                  </div>
                  {selectedAnswer !== correctAnswerIndex.toString() && (
                    <div className="text-cyan-300 mt-2 font-mono">
                      Respuesta correcta: {String.fromCharCode(65 + correctAnswerIndex)}.{" "}
                      {shuffledOptions[correctAnswerIndex]}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 bg-slate-800/60 p-4 rounded-xl border border-cyan-400/60">
                <h4 className="text-cyan-300 font-mono mb-3 text-center">Puntuaciones Actuales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentRoom.players
                    .sort((a, b) => b.score - a.score)
                    .map((player: OnlinePlayer, index) => (
                      <div
                        key={player.id}
                        className={`flex justify-between items-center p-2 rounded ${
                          player.id === playerId ? "bg-cyan-500/20 border border-cyan-400/40" : "bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-mono">#{index + 1}</span>
                          <span className="text-cyan-300 font-mono">{player.name}</span>
                          {player.id === playerId && <span className="text-cyan-400 text-xs">(Tú)</span>}
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-mono font-bold">{player.score}</div>
                          <div className="text-xs text-slate-400">
                            {player.correctAnswers}/{player.totalAnswers}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentRoom.gameState === "finished") {
    const sortedPlayers = [...currentRoom.players].sort((a, b) => b.score - a.score)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <MatrixRain />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <Card className="w-full bg-slate-900/95 border-2 border-cyan-400/60 backdrop-blur-xl shadow-2xl shadow-cyan-400/20">
            <CardHeader className="text-center">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex-1">
                  🏆 RANKING FINAL 🏆
                </CardTitle>
                <ConnectionStatus isConnected={isConnected} connectionError={connectionError} lastUpdate={lastUpdate} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedPlayers.map((player: OnlinePlayer, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 shadow-lg shadow-yellow-400/30"
                        : player.id === playerId
                          ? "bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-400/30"
                          : "bg-slate-800/60 border-cyan-400/60 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <div
                        className={`text-4xl font-bold font-mono ${
                          index === 0
                            ? "text-yellow-400"
                            : index === 1
                              ? "text-slate-300"
                              : index === 2
                                ? "text-orange-600"
                                : "text-cyan-400"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-cyan-100">{player.name}</span>
                          {player.id === playerId && <span className="text-cyan-400 text-sm">(Tú)</span>}
                          {player.isHost && <span className="text-yellow-400 text-sm">(Host)</span>}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-emerald-400">
                            ✓ {player.correctAnswers}/{player.totalAnswers} correctas
                          </span>
                          <span className="text-cyan-400">⚡ {player.averageTime.toFixed(1)}s promedio</span>
                          <span className="text-yellow-400">🔥 Racha máx: {player.maxStreak}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-emerald-400 font-mono">
                        {player.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-cyan-400">puntos</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {((player.correctAnswers / player.totalAnswers) * 100).toFixed(1)}% precisión
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center space-y-4">
                {/* Agregar botones para host y jugadores */}
                <div className="flex gap-4 justify-center">
                  {isHost() && (
                    <button
                      onClick={handleResetGame}
                      disabled={!isConnected}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-400/30 font-mono disabled:opacity-50"
                    >
                      🔄 REINICIAR JUEGO
                    </button>
                  )}
                  <button
                    onClick={handleLeaveRoom}
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-400/30 font-mono"
                  >
                    🎮 NUEVA SALA
                  </button>
                </div>
                {!isHost() && (
                  <p className="text-slate-400 font-mono text-sm">
                    Esperando a que el host reinicie el juego o crea una nueva sala
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
