export interface ReasoningPath {
  text: string
  score: number
}

export interface ChatResponse {
  hypothesis: string
  entities_hyp: string[]
  entities_kg: string[]
  top_paths: ReasoningPath[]
  new_query: string
  response: string
}
