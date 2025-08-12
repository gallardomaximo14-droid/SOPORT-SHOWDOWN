export interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  difficulty: "easy" | "medium" | "hard"
  category: string
}

export const triviaQuestions: Question[] = [
  {
    id: 1,
    question: "¿Cuál es la diferencia principal entre let y var en JavaScript?",
    options: [
      "let tiene scope de función, var tiene scope de bloque",
      "let tiene scope de bloque, var tiene scope de función",
      "No hay diferencia",
      "let es más rápido que var",
    ],
    correct: 1,
    difficulty: "medium",
    category: "JavaScript",
  },
  {
    id: 2,
    question: "¿Qué significa CSS?",
    options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
    correct: 2,
    difficulty: "easy",
    category: "CSS",
  },
  {
    id: 3,
    question: "¿Cuál es la complejidad temporal del algoritmo de ordenamiento QuickSort en el caso promedio?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    correct: 1,
    difficulty: "hard",
    category: "Algoritmos",
  },
  {
    id: 4,
    question: "¿Qué es React?",
    options: [
      "Un lenguaje de programación",
      "Una base de datos",
      "Una librería de JavaScript para construir interfaces de usuario",
      "Un servidor web",
    ],
    correct: 2,
    difficulty: "easy",
    category: "React",
  },
  {
    id: 5,
    question: "¿Cuál es el puerto por defecto para HTTP?",
    options: ["443", "8080", "80", "3000"],
    correct: 2,
    difficulty: "easy",
    category: "Redes",
  },
  {
    id: 6,
    question: "¿Qué es un closure en JavaScript?",
    options: [
      "Una función que tiene acceso a variables de su scope exterior",
      "Una función que se ejecuta inmediatamente",
      "Una función que no retorna nada",
      "Una función que solo acepta parámetros",
    ],
    correct: 0,
    difficulty: "medium",
    category: "JavaScript",
  },
  {
    id: 7,
    question: "¿Cuál es la diferencia entre SQL y NoSQL?",
    options: [
      "SQL es más rápido que NoSQL",
      "SQL usa tablas relacionales, NoSQL usa documentos/key-value",
      "NoSQL es más seguro que SQL",
      "No hay diferencia",
    ],
    correct: 1,
    difficulty: "medium",
    category: "Bases de Datos",
  },
  {
    id: 8,
    question: "¿Qué es Git?",
    options: [
      "Un editor de código",
      "Un sistema de control de versiones",
      "Un lenguaje de programación",
      "Un framework web",
    ],
    correct: 1,
    difficulty: "easy",
    category: "Herramientas",
  },
  {
    id: 9,
    question: "¿Cuál es la complejidad espacial de un algoritmo recursivo para calcular Fibonacci?",
    options: ["O(1)", "O(n)", "O(n²)", "O(2^n)"],
    correct: 1,
    difficulty: "hard",
    category: "Algoritmos",
  },
  {
    id: 10,
    question: "¿Qué es TypeScript?",
    options: [
      "Un reemplazo de JavaScript",
      "Un superset de JavaScript que añade tipado estático",
      "Un framework de JavaScript",
      "Una base de datos",
    ],
    correct: 1,
    difficulty: "medium",
    category: "TypeScript",
  },
  {
    id: 11,
    question: "¿Cuál es el método HTTP para actualizar parcialmente un recurso?",
    options: ["PUT", "POST", "PATCH", "UPDATE"],
    correct: 2,
    difficulty: "medium",
    category: "HTTP",
  },
  {
    id: 12,
    question: "¿Qué es Docker?",
    options: [
      "Un lenguaje de programación",
      "Una plataforma de contenedores",
      "Un sistema operativo",
      "Un editor de código",
    ],
    correct: 1,
    difficulty: "medium",
    category: "DevOps",
  },
  {
    id: 13,
    question: "¿Cuál es la diferencia entre == y === en JavaScript?",
    options: [
      "No hay diferencia",
      "== compara valor y tipo, === solo valor",
      "=== compara valor y tipo, == solo valor",
      "=== es más lento que ==",
    ],
    correct: 2,
    difficulty: "medium",
    category: "JavaScript",
  },
  {
    id: 14,
    question: "¿Qué es una API REST?",
    options: [
      "Un tipo de base de datos",
      "Un estilo arquitectónico para servicios web",
      "Un lenguaje de programación",
      "Un protocolo de red",
    ],
    correct: 1,
    difficulty: "medium",
    category: "APIs",
  },
  {
    id: 15,
    question: "¿Cuál es la complejidad temporal de buscar un elemento en un array ordenado usando búsqueda binaria?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correct: 1,
    difficulty: "hard",
    category: "Algoritmos",
  },
  {
    id: 16,
    question: "¿Qué es Node.js?",
    options: [
      "Un framework de JavaScript",
      "Un runtime de JavaScript para el servidor",
      "Una base de datos",
      "Un editor de código",
    ],
    correct: 1,
    difficulty: "easy",
    category: "Node.js",
  },
  {
    id: 17,
    question: "¿Cuál es el propósito de un CDN?",
    options: [
      "Almacenar bases de datos",
      "Distribuir contenido geográficamente para mejorar velocidad",
      "Compilar código",
      "Gestionar versiones",
    ],
    correct: 1,
    difficulty: "medium",
    category: "Redes",
  },
  {
    id: 18,
    question: "¿Qué es MongoDB?",
    options: [
      "Una base de datos relacional",
      "Una base de datos NoSQL orientada a documentos",
      "Un framework web",
      "Un lenguaje de consulta",
    ],
    correct: 1,
    difficulty: "easy",
    category: "Bases de Datos",
  },
  {
    id: 19,
    question: "¿Cuál es la diferencia entre stack y heap en memoria?",
    options: [
      "Stack es más lento que heap",
      "Stack almacena referencias, heap almacena objetos",
      "No hay diferencia",
      "Heap es más pequeño que stack",
    ],
    correct: 1,
    difficulty: "hard",
    category: "Sistemas",
  },
  {
    id: 20,
    question: "¿Qué es webpack?",
    options: ["Un framework de JavaScript", "Un bundler de módulos", "Una base de datos", "Un servidor web"],
    correct: 1,
    difficulty: "medium",
    category: "Herramientas",
  },
]

// Función para obtener preguntas aleatorias
export function getRandomQuestions(count = 10): Question[] {
  const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, triviaQuestions.length))
}

// Función para obtener preguntas por dificultad
export function getQuestionsByDifficulty(difficulty: "easy" | "medium" | "hard", count = 5): Question[] {
  const filtered = triviaQuestions.filter((q) => q.difficulty === difficulty)
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, filtered.length))
}

// Función para obtener preguntas mixtas balanceadas
export function getBalancedQuestions(count = 10): Question[] {
  const easy = getQuestionsByDifficulty("easy", Math.ceil(count * 0.3))
  const medium = getQuestionsByDifficulty("medium", Math.ceil(count * 0.5))
  const hard = getQuestionsByDifficulty("hard", Math.ceil(count * 0.2))

  const combined = [...easy, ...medium, ...hard]
  const shuffled = combined.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
