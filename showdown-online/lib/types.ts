export interface Player {
  id: string
  name: string
  score: number
  correctAnswers: number
  totalAnswers: number
  averageTime: number
  maxStreak: number
  currentStreak: number
  totalTime: number
}

export interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  difficulty: "easy" | "medium" | "hard"
  category: string
}

export interface OnlinePlayer extends Player {
  isReady: boolean
  isHost: boolean
  lastActivity: number
}

export interface GameRoom {
  id: string
  code: string
  hostId: string
  players: OnlinePlayer[]
  currentQuestion: number
  gameState: "waiting" | "playing" | "finished"
  questions: Question[]
  startTime?: number
  settings: {
    questionCount: number
    timePerQuestion: number
    difficulty: "easy" | "medium" | "hard" | "mixed"
  }
  createdAt: number
}

export interface PlayerAnswer {
  playerId: string
  questionId: number
  answer: number
  timeSpent: number
  timestamp: number
}
