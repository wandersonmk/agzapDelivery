import type { Carrinho, ItemCarrinho, GrupoComplementoSelecionado, ComplementoSelecionado } from '../../shared/types/cardapio'

const CARRINHO_KEY = 'agzap_carrinho'

export const useCarrinho = () => {
  // Estado reativo do carrinho
  const carrinho = useState<Carrinho | null>('carrinho', () => null)

  // Carregar carrinho do localStorage
  const carregarCarrinho = () => {
    if (process.client) {
      const carrinhoSalvo = localStorage.getItem(CARRINHO_KEY)
      if (carrinhoSalvo) {
        try {
          carrinho.value = JSON.parse(carrinhoSalvo)
        } catch (error) {
          console.error('Erro ao carregar carrinho:', error)
          carrinho.value = null
        }
      }
    }
  }

  // Salvar carrinho no localStorage
  const salvarCarrinho = () => {
    if (process.client && carrinho.value) {
      carrinho.value.updated_at = new Date().toISOString()
      localStorage.setItem(CARRINHO_KEY, JSON.stringify(carrinho.value))
    }
  }

  // Inicializar carrinho vazio
  const inicializarCarrinho = (empresaId: string, empresaSlug: string, empresaNome: string, taxaEntrega: number) => {
    carrinho.value = {
      empresa_id: empresaId,
      empresa_slug: empresaSlug,
      empresa_nome: empresaNome,
      itens: [],
      subtotal: 0,
      taxa_entrega: taxaEntrega,
      total: taxaEntrega,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    salvarCarrinho()
  }

  // Calcular totais
  const calcularTotais = () => {
    if (!carrinho.value) return

    // Calcular subtotal (soma dos subtotais dos itens)
    carrinho.value.subtotal = carrinho.value.itens.reduce((total, item) => total + item.subtotal, 0)
    
    // Calcular total (subtotal + taxa de entrega)
    carrinho.value.total = carrinho.value.subtotal + carrinho.value.taxa_entrega
    
    salvarCarrinho()
  }

  // Verificar se produto já está no carrinho com preço diferente
  const verificarMudancaPreco = (produtoId: string, precoAtual: number): { temNoCarrinho: boolean, precoAntigo?: number, diferenca?: number } => {
    if (!carrinho.value) return { temNoCarrinho: false }

    const itemExistente = carrinho.value.itens.find(item => item.produto_id === produtoId)
    
    if (!itemExistente) {
      return { temNoCarrinho: false }
    }

    const precoNoCarrinho = itemExistente.preco_unitario
    const diferenca = Math.abs(precoAtual - precoNoCarrinho)

    // Se diferença > R$ 0.01, considera mudança de preço
    if (diferenca > 0.01) {
      return {
        temNoCarrinho: true,
        precoAntigo: precoNoCarrinho,
        diferenca
      }
    }

    return { temNoCarrinho: true }
  }

  // Adicionar item ao carrinho
  const adicionarItem = (item: Omit<ItemCarrinho, 'id' | 'subtotal'>, opcoes?: { ignorarValidacao?: boolean }) => {
    if (!carrinho.value) return

    // Adicionar timestamp de quando foi adicionado
    const itemComTimestamp = {
      ...item,
      adicionado_em: new Date().toISOString()
    }

    // Calcular preço com complementos
    const precoComplementos = itemComTimestamp.complementos.reduce((total, grupo) => {
      return total + grupo.itens.reduce((subtotal, complemento) => subtotal + complemento.preco, 0)
    }, 0)

    // Calcular subtotal do item
    const subtotal = (itemComTimestamp.preco_unitario + precoComplementos) * itemComTimestamp.quantidade

    // Criar item completo
    const itemCompleto: ItemCarrinho = {
      ...itemComTimestamp,
      id: crypto.randomUUID(),
      subtotal
    } as ItemCarrinho

    // Adicionar ao carrinho
    carrinho.value.itens.push(itemCompleto)
    
    calcularTotais()
  }

  // Remover item do carrinho
  const removerItem = (itemId: string) => {
    if (!carrinho.value) return

    carrinho.value.itens = carrinho.value.itens.filter(item => item.id !== itemId)
    
    calcularTotais()
  }

  // Atualizar quantidade de um item
  const atualizarQuantidade = (itemId: string, novaQuantidade: number) => {
    if (!carrinho.value || novaQuantidade < 1) return

    const item = carrinho.value.itens.find(i => i.id === itemId)
    if (!item) return

    item.quantidade = novaQuantidade

    // Recalcular subtotal do item
    const precoComplementos = item.complementos.reduce((total, grupo) => {
      return total + grupo.itens.reduce((subtotal, complemento) => subtotal + complemento.preco, 0)
    }, 0)
    item.subtotal = (item.preco_unitario + precoComplementos) * item.quantidade

    calcularTotais()
  }

  // Limpar carrinho
  const limparCarrinho = () => {
    if (process.client) {
      localStorage.removeItem(CARRINHO_KEY)
      carrinho.value = null
    }
  }

  // Verificar se carrinho está vazio
  const carrinhoVazio = computed(() => {
    return !carrinho.value || carrinho.value.itens.length === 0
  })

  // Quantidade total de itens
  const quantidadeTotal = computed(() => {
    if (!carrinho.value) return 0
    return carrinho.value.itens.reduce((total, item) => total + item.quantidade, 0)
  })

  // Verificar se pode fazer checkout (valor mínimo, etc)
  const podeFinalizarPedido = (pedidoMinimo: number) => {
    if (!carrinho.value || carrinhoVazio.value) return false
    return carrinho.value.subtotal >= pedidoMinimo
  }

  // Carregar carrinho ao inicializar
  if (process.client && !carrinho.value) {
    carregarCarrinho()
  }

  return {
    carrinho: readonly(carrinho),
    carrinhoVazio,
    quantidadeTotal,
    inicializarCarrinho,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    calcularTotais,
    podeFinalizarPedido,
    verificarMudancaPreco,
    carregarCarrinho
  }
}
