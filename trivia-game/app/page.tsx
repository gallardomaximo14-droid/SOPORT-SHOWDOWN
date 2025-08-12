"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Player, Question } from "@/types"

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

export default function TriviaGame() {
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [totalRounds, setTotalRounds] = useState(5)
  const [gameState, setGameState] = useState<"setup" | "waiting" | "playing" | "finished">("setup")
  const [currentRound, setCurrentRound] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0)
  const [isHost, setIsHost] = useState(false)
  const [playersReady, setPlayersReady] = useState<{ [key: string]: boolean }>({})
  const [gameMode, setGameMode] = useState<"create" | "join">("create")
  const [joinRoomCode, setJoinRoomCode] = useState("")
  const [currentPlayerId, setCurrentPlayerId] = useState("")

  const questions: Question[] = [
    {
      id: 1,
      question: "¿Cuál es la función principal de la RAM en una computadora?",
      options: [
        "Almacenar datos permanentemente",
        "Almacenar datos temporalmente",
        "Procesar gráficos",
        "Conectar a internet",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Hardware",
    },
    {
      id: 2,
      question: "¿Qué protocolo se usa principalmente para transferir páginas web?",
      options: ["FTP", "SMTP", "HTTP", "SSH"],
      correct: 2,
      difficulty: "medium",
      category: "Redes",
    },
    {
      id: 3,
      question: "¿Cuál es la diferencia entre un virus y un malware?",
      options: [
        "No hay diferencia",
        "El virus es un tipo de malware",
        "El malware es más peligroso",
        "Los virus solo afectan Windows",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Seguridad",
    },
    {
      id: 4,
      question: "¿Qué significa CPU?",
      options: ["Computer Processing Unit", "Central Processing Unit", "Central Program Unit", "Computer Program Unit"],
      correct: 1,
      difficulty: "medium",
      category: "Hardware",
    },
    {
      id: 5,
      question: "¿Cuál es la función del DNS?",
      options: [
        "Encriptar datos",
        "Traducir nombres de dominio a direcciones IP",
        "Comprimir archivos",
        "Acelerar internet",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Redes",
    },
    {
      id: 6,
      question: "¿Qué tipo de archivo es .exe?",
      options: ["Imagen", "Documento", "Ejecutable", "Audio"],
      correct: 2,
      difficulty: "medium",
      category: "Software",
    },
    {
      id: 7,
      question: "¿Por qué los programadores prefieren el modo oscuro?",
      options: [
        "Porque son vampiros",
        "Ahorra batería y reduce fatiga visual",
        "Se ve más profesional",
        "Es más rápido",
      ],
      correct: 1,
      difficulty: "easy",
      category: "Humor",
    },
    {
      id: 8,
      question: "¿Qué es un firewall?",
      options: [
        "Un programa antivirus",
        "Una barrera de seguridad de red",
        "Un tipo de procesador",
        "Un navegador web",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Seguridad",
    },
    {
      id: 9,
      question: "¿Cuál es la diferencia entre HTTP y HTTPS?",
      options: ["HTTPS es más rápido", "HTTPS es encriptado y seguro", "No hay diferencia", "HTTP es más nuevo"],
      correct: 1,
      difficulty: "medium",
      category: "Seguridad",
    },
    {
      id: 10,
      question: "¿Qué significa SSD?",
      options: ["Super Speed Drive", "Solid State Drive", "System Storage Device", "Secure Storage Drive"],
      correct: 1,
      difficulty: "medium",
      category: "Hardware",
    },
    {
      id: 11,
      question: "¿Cuál es la función principal de un router?",
      options: ["Almacenar archivos", "Dirigir tráfico de red", "Procesar datos", "Mostrar imágenes"],
      correct: 1,
      difficulty: "medium",
      category: "Redes",
    },
    {
      id: 12,
      question: "¿Qué es la nube (cloud computing)?",
      options: ["Internet más rápido", "Servicios de computación por internet", "Un tipo de software", "Una red local"],
      correct: 1,
      difficulty: "medium",
      category: "Sistemas",
    },
    {
      id: 13,
      question: "¿Cuál es la diferencia entre 32-bit y 64-bit?",
      options: [
        "La velocidad del procesador",
        "La cantidad de datos procesados simultáneamente",
        "El tamaño del disco duro",
        "La resolución de pantalla",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Sistemas",
    },
    {
      id: 14,
      question: "¿Qué es un algoritmo?",
      options: [
        "Un tipo de virus",
        "Un conjunto de instrucciones para resolver un problema",
        "Un programa antivirus",
        "Una página web",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Programación",
    },
    {
      id: 15,
      question: "¿Cuál es la función de un sistema operativo?",
      options: [
        "Solo ejecutar programas",
        "Gestionar hardware y software del sistema",
        "Conectar a internet",
        "Crear documentos",
      ],
      correct: 1,
      difficulty: "medium",
      category: "Sistemas",
    },
    {
      id: 16,
      question: "¿Qué significa IP en dirección IP?",
      options: ["Internet Protocol", "Internal Program", "Information Processing", "Internet Program"],
      correct: 0,
      difficulty: "medium",
      category: "Redes",
    },
  ]

  const shuffleArray = (array: string[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const prepareQuestion = (questionIndex: number) => {
    const question = questions[questionIndex]
    const shuffled = shuffleArray(question.options)
    const correctAnswerIndex = shuffled.indexOf(question.options[question.correct])

    setShuffledOptions(shuffled)
    setCorrectAnswerIndex(correctAnswerIndex)
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = () => {
    if (!playerName.trim()) return

    const code = generateRoomCode()
    const playerId = Date.now().toString()
    setRoomCode(code)
    setCurrentPlayerId(playerId)
    setIsHost(true)
    setGameState("waiting")

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      averageTime: 0,
      maxStreak: 0,
      currentStreak: 0,
      totalTime: 0,
    }

    setPlayers([newPlayer])
    setPlayersReady({ [playerId]: false })
  }

  const joinRoom = () => {
    if (!playerName.trim() || !joinRoomCode.trim()) return

    const playerId = Date.now().toString()
    setRoomCode(joinRoomCode)
    setCurrentPlayerId(playerId)
    setIsHost(false)
    setGameState("waiting")

    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      averageTime: 0,
      maxStreak: 0,
      currentStreak: 0,
      totalTime: 0,
    }

    const existingPlayers = [
      {
        id: "host",
        name: "Host Player",
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        averageTime: 0,
        maxStreak: 0,
        currentStreak: 0,
        totalTime: 0,
      },
    ]

    setPlayers([...existingPlayers, newPlayer])
    setPlayersReady({ host: false, [playerId]: false })
  }

  const toggleReady = () => {
    setPlayersReady((prev) => ({
      ...prev,
      [currentPlayerId]: !prev[currentPlayerId],
    }))
  }

  const startGame = () => {
    const allReady = Object.values(playersReady).every((ready) => ready)
    if (!allReady && players.length > 1) return

    setGameState("playing")
    setCurrentRound(1)
    setCurrentQuestion(0)
    setTimeLeft(15)
    prepareQuestion(0)
  }

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return

    setSelectedAnswer(answerIndex.toString())
    setShowResult(true)

    const isCorrect = answerIndex === correctAnswerIndex
    const responseTime = 15 - timeLeft

    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === currentPlayerId) {
          const newCorrectAnswers = isCorrect ? player.correctAnswers + 1 : player.correctAnswers
          const newTotalAnswers = player.totalAnswers + 1
          const newTotalTime = player.totalTime + responseTime
          const newCurrentStreak = isCorrect ? player.currentStreak + 1 : 0
          const newMaxStreak = Math.max(player.maxStreak, newCurrentStreak)

          let points = 0
          if (isCorrect) {
            const timeBonus = Math.max(0, 15 - responseTime)
            const difficultyMultiplier =
              questions[currentQuestion].difficulty === "easy"
                ? 1
                : questions[currentQuestion].difficulty === "medium"
                  ? 1.5
                  : 2
            points = Math.round((100 + timeBonus * 10) * difficultyMultiplier)
          }

          return {
            ...player,
            score: player.score + points,
            correctAnswers: newCorrectAnswers,
            totalAnswers: newTotalAnswers,
            totalTime: newTotalTime,
            averageTime: newTotalTime / newTotalAnswers,
            currentStreak: newCurrentStreak,
            maxStreak: newMaxStreak,
          }
        }
        return player
      }),
    )

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setShowResult(false)

    if (currentRound < totalRounds) {
      setCurrentRound((prev) => prev + 1)
      const nextQuestionIndex = currentRound % questions.length
      setCurrentQuestion(nextQuestionIndex)
      setTimeLeft(15)
      prepareQuestion(nextQuestionIndex)
    } else {
      setGameState("finished")
    }
  }

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(-1)
    }
  }, [timeLeft, gameState, selectedAnswer])

  const resetGame = () => {
    setGameState("setup")
    setCurrentRound(0)
    setCurrentQuestion(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowResult(false)
    setPlayers([])
    setPlayerName("")
    setRoomCode("")
    setIsHost(false)
    setPlayersReady({})
    setGameMode("create")
    setJoinRoomCode("")
    setCurrentPlayerId("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-90">
        <MatrixRain />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {gameState === "setup" && (
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-pulse">
                SOPORT SHOWDOWN
              </h1>
              <p className="text-slate-300 text-lg font-mono">Demuestra tus conocimientos técnicos</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-cyan-400 font-mono mb-2">Nombre del Jugador</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/50 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Ingresa tu nombre"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGameMode("create")}
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
                    <label className="block text-cyan-400 font-mono mb-2">Número de Rondas (1-20)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={totalRounds}
                      onChange={(e) => {
                        const value = Math.min(20, Math.max(1, Number.parseInt(e.target.value) || 1))
                        setTotalRounds(value)
                      }}
                      className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/50 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <p className="text-slate-400 text-sm mt-1 font-mono">Máximo 20 rondas permitidas</p>
                  </div>

                  <button
                    onClick={createRoom}
                    disabled={!playerName.trim()}
                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg shadow-lg hover:shadow-cyan-500/25"
                  >
                    CREAR SALA
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
                    />
                  </div>

                  <button
                    onClick={joinRoom}
                    disabled={!playerName.trim() || !joinRoomCode.trim()}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-lg shadow-lg hover:shadow-emerald-500/25"
                  >
                    UNIRSE A SALA
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {gameState === "waiting" && (
          <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-cyan-400 mb-4 font-mono">SALA CREADA</h2>
              <div className="bg-slate-800 rounded-lg p-4 mb-6">
                <p className="text-slate-300 font-mono mb-2">Código de la sala:</p>
                <p className="text-3xl font-bold text-emerald-400 font-mono tracking-wider">{roomCode}</p>
              </div>
              <p className="text-slate-400 font-mono">Comparte este código con tus amigos para que se unan</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-4 font-mono">Jugadores ({players.length})</h3>
                <div className="space-y-3">
                  {players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <span className="text-white font-mono">{player.name}</span>
                        {player.id === currentPlayerId && <span className="text-cyan-400 text-sm font-mono">(Tú)</span>}
                        {isHost && player.id !== currentPlayerId && (
                          <span className="text-yellow-400 text-sm font-mono">(Invitado)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {playersReady[player.id] ? (
                          <span className="text-emerald-400 font-mono text-sm">✓ Listo</span>
                        ) : (
                          <span className="text-slate-400 font-mono text-sm">Esperando...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={toggleReady}
                  className={`flex-1 py-3 rounded-lg font-mono font-bold transition-all ${
                    playersReady[currentPlayerId]
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {playersReady[currentPlayerId] ? "LISTO ✓" : "MARCAR COMO LISTO"}
                </button>

                {isHost && (
                  <button
                    onClick={startGame}
                    disabled={!Object.values(playersReady).every((ready) => ready) && players.length > 1}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono shadow-lg"
                  >
                    INICIAR JUEGO
                  </button>
                )}
              </div>

              {!isHost && (
                <p className="text-center text-slate-400 font-mono">Esperando a que el host inicie el juego...</p>
              )}
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <Card className="w-full max-w-4xl bg-slate-950/95 border-2 border-cyan-400/60 backdrop-blur-xl shadow-2xl shadow-cyan-400/20 slide-up">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <Badge variant="outline" className="border-cyan-400/60 text-cyan-400 font-mono">
                    Ronda {currentRound}/{totalRounds}
                  </Badge>
                  <Badge variant="outline" className="border-yellow-400/60 text-yellow-400 font-mono">
                    {questions[currentQuestion]?.difficulty?.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400 font-mono">⏱️ {timeLeft}s</div>
                  <Progress value={(timeLeft / 15) * 100} className="w-24 h-2 mt-1" />
                </div>
              </div>

              <Card className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-400/80 shadow-lg shadow-cyan-400/20 pulse-glow">
                <CardContent className="p-6">
                  <CardTitle className="text-2xl font-bold text-cyan-100 mb-4 text-center leading-relaxed">
                    {questions[currentQuestion]?.question}
                  </CardTitle>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="border-purple-400/60 text-purple-400 font-mono">
                      📚 {questions[currentQuestion]?.category}
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
                    disabled={selectedAnswer !== null}
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
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-cyan-300 font-mono">👤 {players[0]?.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      {players[0]?.score.toLocaleString()} pts
                    </div>
                    <div className="text-sm text-cyan-400 font-mono">
                      {players[0]?.correctAnswers}/{players[0]?.totalAnswers} correctas
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {gameState === "finished" && (
          <Card className="w-full max-w-4xl bg-slate-950/95 border-2 border-cyan-400/60 backdrop-blur-xl shadow-2xl shadow-cyan-400/20 bounce-in">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6">
                🏆 RANKING FINAL 🏆
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 shadow-lg shadow-yellow-400/30 glow-effect"
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
                          <div className="text-xl font-bold text-cyan-100 mb-1">{player.name}</div>
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

              <div className="mt-8 text-center">
                <Button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-400/30 font-mono"
                >
                  🎮 JUGAR DE NUEVO
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
