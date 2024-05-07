import { type Nodes, type Edges, type Paths } from 'v-network-graph'

export interface Graph {
  nodes: Nodes
  edges: Edges
  paths: Paths
}

export interface ChatResponse {
  hypothesis: string
  entities_hyp: string[]
  entities_kg: string[]
  new_query: string
  response: string
  graph: Graph
}
