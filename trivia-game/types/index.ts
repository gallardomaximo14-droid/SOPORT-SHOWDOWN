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
