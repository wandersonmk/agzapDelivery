// Tipos para o sistema de cardápio público

export interface ComplementoSelecionado {
  id: string
  nome: string
  preco: number
}

export interface GrupoComplementoSelecionado {
  grupo_id: string
  grupo_nome: string
  itens: ComplementoSelecionado[]
}

export interface ItemCarrinho {
  id: string // UUID único do item no carrinho
  produto_id: string
  nome: string
  descricao?: string
  imagem: string | null
  tamanho?: 'P' | 'G' | 'F' // Se for produto por tamanho
  preco_unitario: number // Preço do tamanho selecionado
  quantidade: number
  complementos: GrupoComplementoSelecionado[]
  observacoes?: string
  subtotal: number // preco_unitario * quantidade + complementos
}

export interface Carrinho {
  empresa_id: string
  empresa_slug: string
  empresa_nome: string
  itens: ItemCarrinho[]
  subtotal: number // Soma dos subtotais dos itens
  taxa_entrega: number
  total: number // subtotal + taxa_entrega
  created_at: string
  updated_at: string
}

export interface RestaurantePublico {
  id: string
  slug: string
  nome: string
  descricao?: string
  telefone?: string
  whatsapp?: string
  endereco?: string
  imagem_banner?: string
  logo?: string
  cor_tema: string
  cardapio_ativo: boolean
  aceita_pedidos_online: boolean
  taxa_entrega: number
  pedido_minimo: number
  tempo_preparo_min: number
  raio_entrega_km?: number
  horario_funcionamento?: {
    dia: number // 0=Dom, 1=Seg, ..., 6=Sab
    abertura: string // "08:00"
    fechamento: string // "22:00"
    aberto: boolean
  }[]
}

export interface CategoriaProduto {
  id: string
  nome: string
  descricao?: string
  ordem: number
  ativa: boolean
  imagem?: string
}

export interface ProdutoPublico {
  id: string
  nome: string
  descricao?: string
  imagem?: string
  categoria_id: string
  categoria_nome: string
  tipo: 'comum' | 'pizza'
  preco?: number // Para tipo 'comum'
  preco_promocional?: number
  promocao_ativa?: boolean
  tamanhos?: { // Para tipo 'pizza'
    tamanho: 'P' | 'G' | 'F'
    preco: number
  }[]
  ativo: boolean
  destaque: boolean
  grupos_complementos?: {
    id: string
    nome: string
    obrigatorio: boolean
    minimo: number
    maximo: number
    complementos: {
      id: string
      nome: string
      preco: number
      disponivel: boolean
    }[]
  }[]
}

export interface DadosCheckout {
  nome_cliente: string
  telefone_cliente: string
  tipo_retirada: 'entrega' | 'retirada'
  endereco?: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep?: string
    referencia?: string
  }
  forma_pagamento: 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix'
  troco?: number
  observacoes?: string
}

export interface PedidoConfirmado {
  id: string
  numero_pedido: string
  token_rastreamento: string
  tempo_estimado: number
  valor_total: number
  created_at: string
}
