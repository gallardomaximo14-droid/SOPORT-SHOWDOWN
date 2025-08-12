import type { GameRoom, OnlinePlayer, PlayerAnswer } from "./types"

class GameStore {
  private rooms: Map<string, GameRoom> = new Map()
  private playerAnswers: Map<string, PlayerAnswer[]> = new Map()
  private questionTimers: Map<string, NodeJS.Timeout> = new Map()

  // Generar código único de sala
  generateRoomCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Crear nueva sala
  createRoom(hostId: string, hostName: string): GameRoom {
    const code = this.generateRoomCode()
    const room: GameRoom = {
      id: `room_${Date.now()}_${Math.random()}`,
      code,
      hostId,
      players: [
        {
          id: hostId,
          name: hostName,
          score: 0,
          correctAnswers: 0,
          totalAnswers: 0,
          averageTime: 0,
          maxStreak: 0,
          currentStreak: 0,
          totalTime: 0,
          isReady: false,
          isHost: true,
          lastActivity: Date.now(),
        },
      ],
      currentQuestion: 0,
      gameState: "waiting",
      questions: [],
      settings: {
        questionCount: 10,
        timePerQuestion: 30,
        difficulty: "mixed",
      },
      createdAt: Date.now(),
    }

    this.rooms.set(room.id, room)
    return room
  }

  // Unirse a sala por código
  joinRoom(code: string, playerId: string, playerName: string): GameRoom | null {
    const room = Array.from(this.rooms.values()).find((r) => r.code === code)
    if (!room || room.gameState !== "waiting") return null

    // Verificar si el jugador ya está en la sala
    const existingPlayer = room.players.find((p) => p.id === playerId)
    if (existingPlayer) {
      existingPlayer.lastActivity = Date.now()
      return room
    }

    // Agregar nuevo jugador
    const newPlayer: OnlinePlayer = {
      id: playerId,
      name: playerName,
      score: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      averageTime: 0,
      maxStreak: 0,
      currentStreak: 0,
      totalTime: 0,
      isReady: false,
      isHost: false,
      lastActivity: Date.now(),
    }

    room.players.push(newPlayer)
    this.rooms.set(room.id, room)
    return room
  }

  // Obtener sala por ID
  getRoom(roomId: string): GameRoom | null {
    return this.rooms.get(roomId) || null
  }

  // Obtener sala por código
  getRoomByCode(code: string): GameRoom | null {
    return Array.from(this.rooms.values()).find((r) => r.code === code) || null
  }

  // Actualizar estado del jugador
  updatePlayerReady(roomId: string, playerId: string, isReady: boolean): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const player = room.players.find((p) => p.id === playerId)
    if (!player) return false

    player.isReady = isReady
    player.lastActivity = Date.now()
    this.rooms.set(roomId, room)
    return true
  }

  // Mejorar el inicio del juego con timer automático
  startGame(roomId: string, questions: any[]): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.gameState !== "waiting") return false

    room.gameState = "playing"
    room.questions = questions
    room.startTime = Date.now()
    room.currentQuestion = 0

    // Iniciar timer para la primera pregunta
    this.startQuestionTimer(roomId)

    this.rooms.set(roomId, room)
    return true
  }

  // Nuevo método para manejar timers de preguntas
  private startQuestionTimer(roomId: string): void {
    // Limpiar timer existente
    const existingTimer = this.questionTimers.get(roomId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Crear nuevo timer de 35 segundos (30s + 5s buffer)
    const timer = setTimeout(() => {
      this.autoAdvanceQuestion(roomId)
    }, 35000)

    this.questionTimers.set(roomId, timer)
  }

  // Avanzar pregunta automáticamente
  private autoAdvanceQuestion(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room || room.gameState !== "playing") return

    if (room.currentQuestion < room.questions.length - 1) {
      room.currentQuestion++
      this.startQuestionTimer(roomId) // Iniciar timer para siguiente pregunta
    } else {
      // Terminar juego
      room.gameState = "finished"
      this.clearQuestionTimer(roomId)
    }

    this.rooms.set(roomId, room)
  }

  // Limpiar timer de pregunta
  private clearQuestionTimer(roomId: string): void {
    const timer = this.questionTimers.get(roomId)
    if (timer) {
      clearTimeout(timer)
      this.questionTimers.delete(roomId)
    }
  }

  // Mejorar registro de respuestas con verificación de todos los jugadores
  submitAnswer(roomId: string, playerId: string, answer: PlayerAnswer): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.gameState !== "playing") return false

    const roomAnswers = this.playerAnswers.get(roomId) || []

    // Verificar si el jugador ya respondió esta pregunta
    const existingAnswer = roomAnswers.find((a) => a.playerId === playerId && a.questionId === answer.questionId)
    if (existingAnswer) return false // Ya respondió

    roomAnswers.push(answer)
    this.playerAnswers.set(roomId, roomAnswers)

    // Actualizar estadísticas del jugador
    const player = room.players.find((p) => p.id === playerId)
    if (player) {
      player.totalAnswers++
      player.totalTime += answer.timeSpent
      player.averageTime = player.totalTime / player.totalAnswers
      player.lastActivity = Date.now()

      // Verificar si la respuesta es correcta
      const question = room.questions[answer.questionId]
      if (question && question.correct === answer.answer) {
        player.correctAnswers++
        player.currentStreak++
        player.maxStreak = Math.max(player.maxStreak, player.currentStreak)

        // Calcular puntos basado en tiempo y dificultad
        const timeBonus = Math.max(0, 30 - answer.timeSpent) * 10
        const difficultyMultiplier = question.difficulty === "hard" ? 3 : question.difficulty === "medium" ? 2 : 1
        player.score += (100 + timeBonus) * difficultyMultiplier
      } else {
        player.currentStreak = 0
      }
    }

    // Verificar si todos los jugadores han respondido
    const currentQuestionAnswers = roomAnswers.filter((a) => a.questionId === answer.questionId)
    if (currentQuestionAnswers.length === room.players.length) {
      // Todos respondieron, avanzar inmediatamente
      setTimeout(() => {
        this.autoAdvanceQuestion(roomId)
      }, 2000) // 2 segundos para mostrar resultado
    }

    this.rooms.set(roomId, room)
    return true
  }

  // Nuevo método para reiniciar juego
  resetGame(roomId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    // Limpiar timer
    this.clearQuestionTimer(roomId)

    // Resetear estado del juego
    room.gameState = "waiting"
    room.currentQuestion = 0
    room.questions = []
    room.startTime = undefined

    // Resetear estadísticas de jugadores pero mantener ready state
    room.players.forEach((player) => {
      player.score = 0
      player.correctAnswers = 0
      player.totalAnswers = 0
      player.averageTime = 0
      player.maxStreak = 0
      player.currentStreak = 0
      player.totalTime = 0
      player.isReady = false
      player.lastActivity = Date.now()
    })

    // Limpiar respuestas
    this.playerAnswers.delete(roomId)

    this.rooms.set(roomId, room)
    return true
  }

  // Mejorar limpieza de salas inactivas
  cleanupInactiveRooms(): void {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    for (const [roomId, room] of this.rooms.entries()) {
      const lastActivity = Math.max(...room.players.map((p) => p.lastActivity))
      if (now - lastActivity > oneHour) {
        this.clearQuestionTimer(roomId)
        this.rooms.delete(roomId)
        this.playerAnswers.delete(roomId)
      }
    }
  }

  // Mejorar remoción de jugadores
  removePlayer(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    room.players = room.players.filter((p) => p.id !== playerId)

    // Si era el host y quedan jugadores, asignar nuevo host
    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id
      room.players[0].isHost = true
    }

    // Si no quedan jugadores, eliminar sala
    if (room.players.length === 0) {
      this.clearQuestionTimer(roomId)
      this.rooms.delete(roomId)
      this.playerAnswers.delete(roomId)
    } else {
      this.rooms.set(roomId, room)
    }

    return true
  }

  // Nuevo método para obtener estadísticas de la sala
  getRoomStats(roomId: string): any {
    const room = this.rooms.get(roomId)
    if (!room) return null

    const answers = this.playerAnswers.get(roomId) || []

    return {
      totalPlayers: room.players.length,
      totalAnswers: answers.length,
      averageScore: room.players.reduce((sum, p) => sum + p.score, 0) / room.players.length,
      questionsCompleted: room.currentQuestion + (room.gameState === "finished" ? 1 : 0),
      gameProgress:
        room.gameState === "playing"
          ? ((room.currentQuestion + 1) / room.questions.length) * 100
          : room.gameState === "finished"
            ? 100
            : 0,
    }
  }
}

export const gameStore = new GameStore()

// Iniciar limpieza automática cada 30 minutos
setInterval(
  () => {
    gameStore.cleanupInactiveRooms()
  },
  30 * 60 * 1000,
)
