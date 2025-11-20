/**
 * Tipos para sistema de complementos/adicionais (estilo iFood)
 */

// Complemento individual (ex: "Bacon +R$3", "Cheddar +R$2")
export interface Complemento {
  id: string
  grupo_id: string
  nome: string
  descricao?: string
  preco: number // Preço adicional (pode ser 0 para opções gratuitas)
  ativo: boolean
  ordem: number
  created_at?: string
  updated_at?: string
}

// Grupo de complementos (ex: "Adicionais", "Ponto da Carne", "Molhos")
export interface GrupoComplemento {
  id: string
  empresa_id: string
  nome: string
  descricao?: string
  obrigatorio: boolean // Se o cliente PRECISA escolher ao menos 1
  min_opcoes: number // Mínimo de opções que podem ser escolhidas
  max_opcoes: number | null // Máximo de opções (null = ilimitado)
  ativo: boolean
  created_at?: string
  updated_at?: string
  complementos?: Complemento[] // Lista de complementos do grupo (carregado via join)
}

// Relacionamento Produto <-> Grupo de Complementos
export interface ProdutoGrupoComplemento {
  id: string
  produto_id: string
  grupo_id: string
  ordem: number
  created_at?: string
  grupo?: GrupoComplemento // Dados do grupo (carregado via join)
}

// Complemento selecionado pelo cliente (usado no carrinho)
export interface ComplementoSelecionado {
  id: string
  nome: string
  preco: number
  quantidade?: number // Para quando pode selecionar múltiplas vezes
}

// Grupo com seleções do cliente (usado no carrinho)
export interface GrupoComplementoSelecionado {
  grupo_id: string
  grupo_nome: string
  obrigatorio: boolean
  complementos_selecionados: ComplementoSelecionado[]
}

// Estado do composable useComplementos
export interface ComplementosState {
  grupos: GrupoComplemento[]
  complementos: Complemento[]
  loading: boolean
  error: string | null
}

// DTOs para criação/edição
export type NovoComplemento = Omit<Complemento, 'id' | 'created_at' | 'updated_at'>
export type NovoGrupoComplemento = Omit<GrupoComplemento, 'id' | 'created_at' | 'updated_at' | 'complementos'>
export type NovoProdutoGrupoComplemento = Omit<ProdutoGrupoComplemento, 'id' | 'created_at' | 'grupo'>
