// Tipos para o sistema de cardápio
import type { GrupoComplemento, ComplementoSelecionado, GrupoComplementoSelecionado } from './complementos.types'

export interface Categoria {
  id: string
  nome: string
  descricao?: string
  ordem: number
  ativa: boolean
  icone?: string
}

// DEPRECATED: Usar GrupoComplemento e Complemento de complementos.types
export interface ComplementoOld {
  id: string
  nome: string
  preco: number
  descricao?: string
  obrigatorio: boolean
  categoria: string // categoria do complemento (ex: "Adicionais", "Bebidas", etc.)
  disponivel: boolean
}

export interface SaborPizza {
  nome: string
  preco: number
  ingredientes: string[]
}

export interface Produto {
  id: string
  nome: string
  preco: number
  descricao: string
  foto?: string
  categoriaId: string
  ativo: boolean
  tipo: 'comum' | 'pizza'
  // Para pizzas
  sabores?: SaborPizza[]
  tamanhos?: {
    nome: string
    multiplicador: number // 1.0 para pequena, 1.2 para média, 1.5 para grande
  }[]
  // Grupos de complementos disponíveis para este produto
  grupos_complementos?: GrupoComplemento[]
}

export interface ItemCarrinho {
  produtoId: string
  produto: Produto
  quantidade: number
  // Novo sistema de complementos
  grupos_complementos_selecionados?: GrupoComplementoSelecionado[]
  // Para pizzas
  saboresSelecionados?: SaborPizza[]
  tamanhoSelecionado?: string
  precoCalculado: number
  observacoes?: string
}

export interface CardapioState {
  categorias: Categoria[]
  produtos: Produto[]
  carrinho: ItemCarrinho[]
}
