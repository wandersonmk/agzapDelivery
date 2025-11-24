import type { RestaurantePublico, CategoriaProduto, ProdutoPublico } from '~/../../shared/types/cardapio'

export const useCardapioPublico = () => {
  // Usar cliente Supabase do Nuxt (apenas client-side)
  const supabaseClient = useSupabaseClient()

  /**
   * Buscar restaurante por slug
   */
  const buscarRestaurantePorSlug = async (slug: string): Promise<RestaurantePublico | null> => {
    try {
      const { data, error } = await supabaseClient
        .from('empresas')
        .select(`
          id,
          nome,
          slug,
          telefone,
          logotipo,
          imagem_banner,
          cor_tema,
          cardapio_ativo,
          aceita_pedidos_online,
          taxa_entrega,
          pedido_minimo,
          tempo_preparo_min,
          raio_entrega_km,
          mensagem_whatsapp,
          endereco,
          aberto,
          hora_abertura,
          hora_fechamento
        `)
        .eq('slug', slug)
        .eq('cardapio_ativo', true)
        .single()

      if (error) {
        console.error('Erro ao buscar restaurante:', error)
        return null
      }

      if (!data) return null

      // Mapear para o tipo RestaurantePublico
      return {
        id: data.id,
        slug: data.slug,
        nome: data.nome,
        telefone: data.telefone || '',
        whatsapp: data.telefone || '', // Usar telefone como whatsapp
        logo: data.logotipo || '',
        imagem_banner: data.imagem_banner || '',
        cor_tema: data.cor_tema || '#f97316',
        cardapio_ativo: data.cardapio_ativo,
        aceita_pedidos_online: data.aceita_pedidos_online,
        taxa_entrega: Number(data.taxa_entrega) || 0,
        pedido_minimo: Number(data.pedido_minimo) || 0,
        tempo_preparo_min: data.tempo_preparo_min || 45,
        raio_entrega_km: Number(data.raio_entrega_km) || 5,
        horario_funcionamento: [],
        endereco_completo: data.endereco || '',
        aberto: data.aberto || false,
        hora_abertura: data.hora_abertura || '',
        hora_fechamento: data.hora_fechamento || ''
      } as any
    } catch (error) {
      console.error('Erro ao buscar restaurante:', error)
      return null
    }
  }

  /**
   * Buscar categorias do restaurante
   */
  const buscarCategorias = async (empresaId: string): Promise<CategoriaProduto[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('categorias')
        .select('id, nome, descricao, ordem')
        .eq('empresa_id', empresaId)
        .eq('ativa', true)
        .order('ordem', { ascending: true })

      if (error) {
        console.error('Erro ao buscar categorias:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return []
    }
  }

  /**
   * Buscar produtos do restaurante
   */
  const buscarProdutos = async (empresaId: string): Promise<ProdutoPublico[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('produtos')
        .select(`
          id,
          nome,
          descricao,
          preco,
          preco_promocional,
          promocao_ativa,
          foto,
          categoria_id,
          tipo,
          tamanhos,
          ativo
        `)
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        return []
      }

      if (!data) return []

      // Buscar grupos de complementos para cada produto
      const produtosComComplementos = await Promise.all(
        data.map(async (produto: any) => {
          const { data: grupos, error: gruposError } = await supabaseClient
            .from('produto_grupos_complementos')
            .select(`
              grupo_id,
              grupos_complementos!inner (
                id,
                nome,
                min_opcoes,
                max_opcoes,
                obrigatorio
              )
            `)
            .eq('produto_id', produto.id)

          if (gruposError) {
            console.error('Erro ao buscar grupos:', gruposError)
            return {
              ...produto,
              imagem: produto.foto,
              grupos_complementos: []
            }
          }

          const gruposComplementos = await Promise.all(
            (grupos || []).map(async (g: any) => {
              const { data: complementos } = await supabaseClient
                .from('complementos')
                .select('id, nome, preco')
                .eq('grupo_id', g.grupo_id)
                .eq('ativo', true)

              return {
                id: g.grupos_complementos.id,
                nome: g.grupos_complementos.nome,
                min_itens: g.grupos_complementos.min_opcoes,
                max_itens: g.grupos_complementos.max_opcoes,
                obrigatorio: g.grupos_complementos.obrigatorio,
                complementos: complementos || []
              }
            })
          )

          return {
            ...produto,
            imagem: produto.foto,
            grupos_complementos: gruposComplementos
          }
        })
      )

      return produtosComComplementos
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      return []
    }
  }

  /**
   * Criar pedido online
   */
  const criarPedidoOnline = async (pedido: {
    empresa_id: string
    nome_cliente: string
    telefone_cliente: string
    tipo_retirada: 'entrega' | 'retirada'
    endereco?: any
    forma_pagamento: string
    troco?: number
    observacoes?: string
    itens: any[]
    subtotal: number
    taxa_entrega: number
    total: number
  }) => {
    try {
      const token = crypto.randomUUID()

      const { data, error } = await supabaseClient
        .from('pedidos')
        .insert({
          empresa_id: pedido.empresa_id,
          nome_cliente: pedido.nome_cliente,
          telefone_cliente: pedido.telefone_cliente,
          tipo_retirada: pedido.tipo_retirada,
          endereco_entrega: pedido.endereco ? JSON.stringify(pedido.endereco) : null,
          forma_pagamento: pedido.forma_pagamento,
          troco_para: pedido.troco || null,
          observacoes: pedido.observacoes || null,
          itens_json: pedido.itens,
          subtotal: pedido.subtotal,
          taxa_entrega: pedido.taxa_entrega,
          valor_total: pedido.total,
          status: 'pendente',
          origem: 'online',
          token_rastreamento: token,
          ip_cliente: null, // TODO: Capturar IP do cliente
          user_agent: navigator.userAgent
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar pedido:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erro ao criar pedido:', error)
      throw error
    }
  }

  return {
    buscarRestaurantePorSlug,
    buscarCategorias,
    buscarProdutos,
    criarPedidoOnline
  }
}
