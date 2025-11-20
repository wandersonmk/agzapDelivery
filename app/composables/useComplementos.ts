import type {
  GrupoComplemento,
  Complemento,
  NovoGrupoComplemento,
  NovoComplemento,
  ProdutoGrupoComplemento,
  NovoProdutoGrupoComplemento,
  ComplementosState
} from '@shared/types/complementos.types'

export const useComplementos = () => {
  const supabase = useSupabaseClient()
  const { getEmpresaId } = useEmpresa()

  const state = useState<ComplementosState>('complementos', () => ({
    grupos: [],
    complementos: [],
    loading: false,
    error: null
  }))

  // ============= GRUPOS DE COMPLEMENTOS =============

  /**
   * Buscar todos os grupos de complementos da empresa
   */
  const buscarGrupos = async (): Promise<GrupoComplemento[]> => {
    const empresaId = await getEmpresaId()
    if (!empresaId) {
      state.value.error = 'Empresa não identificada'
      return []
    }

    try {
      state.value.loading = true
      state.value.error = null

      const { data, error } = await supabase
        .from('grupos_complementos')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('nome')

      if (error) throw error

      state.value.grupos = data || []
      return data || []
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao buscar grupos:', e)
      return []
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Buscar grupo por ID com seus complementos
   */
  const buscarGrupoPorId = async (grupoId: string): Promise<GrupoComplemento | null> => {
    try {
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_complementos')
        .select('*')
        .eq('id', grupoId)
        .single()

      if (grupoError) throw grupoError

      const { data: complementos, error: complementosError } = await supabase
        .from('complementos')
        .select('*')
        .eq('grupo_id', grupoId)
        .order('ordem')

      if (complementosError) throw complementosError

      return {
        ...grupo,
        complementos: complementos || []
      }
    } catch (e: any) {
      console.error('Erro ao buscar grupo:', e)
      return null
    }
  }

  /**
   * Criar novo grupo de complementos
   */
  const criarGrupo = async (grupo: NovoGrupoComplemento): Promise<GrupoComplemento | null> => {
    const empresaId = await getEmpresaId()
    if (!empresaId) {
      state.value.error = 'Empresa não identificada'
      return null
    }

    try {
      state.value.loading = true
      state.value.error = null

      const { data, error } = await supabase
        .from('grupos_complementos')
        .insert([{ ...grupo, empresa_id: empresaId }])
        .select()
        .single()

      if (error) throw error

      await buscarGrupos() // Recarregar lista
      return data
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao criar grupo:', e)
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Atualizar grupo existente
   */
  const atualizarGrupo = async (grupoId: string, dados: Partial<NovoGrupoComplemento>): Promise<boolean> => {
    try {
      state.value.loading = true
      state.value.error = null

      const { error } = await supabase
        .from('grupos_complementos')
        .update(dados)
        .eq('id', grupoId)

      if (error) throw error

      await buscarGrupos() // Recarregar lista
      return true
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao atualizar grupo:', e)
      return false
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Excluir grupo (e todos seus complementos em cascata)
   */
  const excluirGrupo = async (grupoId: string): Promise<boolean> => {
    try {
      state.value.loading = true
      state.value.error = null

      const { error } = await supabase
        .from('grupos_complementos')
        .delete()
        .eq('id', grupoId)

      if (error) throw error

      await buscarGrupos() // Recarregar lista
      return true
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao excluir grupo:', e)
      return false
    } finally {
      state.value.loading = false
    }
  }

  // ============= COMPLEMENTOS =============

  /**
   * Buscar complementos de um grupo
   */
  const buscarComplementosPorGrupo = async (grupoId: string): Promise<Complemento[]> => {
    try {
      const { data, error } = await supabase
        .from('complementos')
        .select('*')
        .eq('grupo_id', grupoId)
        .order('ordem')

      if (error) throw error
      return data || []
    } catch (e: any) {
      console.error('Erro ao buscar complementos:', e)
      return []
    }
  }

  /**
   * Criar novo complemento
   */
  const criarComplemento = async (complemento: NovoComplemento): Promise<Complemento | null> => {
    try {
      state.value.loading = true
      state.value.error = null

      const { data, error } = await supabase
        .from('complementos')
        .insert([complemento])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao criar complemento:', e)
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Atualizar complemento existente
   */
  const atualizarComplemento = async (complementoId: string, dados: Partial<NovoComplemento>): Promise<boolean> => {
    try {
      state.value.loading = true
      state.value.error = null

      const { error } = await supabase
        .from('complementos')
        .update(dados)
        .eq('id', complementoId)

      if (error) throw error
      return true
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao atualizar complemento:', e)
      return false
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Excluir complemento
   */
  const excluirComplemento = async (complementoId: string): Promise<boolean> => {
    try {
      state.value.loading = true
      state.value.error = null

      const { error } = await supabase
        .from('complementos')
        .delete()
        .eq('id', complementoId)

      if (error) throw error
      return true
    } catch (e: any) {
      state.value.error = e.message
      console.error('Erro ao excluir complemento:', e)
      return false
    } finally {
      state.value.loading = false
    }
  }

  // ============= PRODUTO <-> GRUPOS =============

  /**
   * Buscar grupos vinculados a um produto
   */
  const buscarGruposDoProduto = async (produtoId: string): Promise<GrupoComplemento[]> => {
    try {
      const { data, error } = await supabase
        .from('produto_grupos_complementos')
        .select(`
          *,
          grupo:grupos_complementos (
            *,
            complementos (*)
          )
        `)
        .eq('produto_id', produtoId)
        .order('ordem')

      if (error) throw error

      // Extrair os grupos com seus complementos
      return (data || []).map((item: any) => item.grupo).filter(Boolean)
    } catch (e: any) {
      console.error('Erro ao buscar grupos do produto:', e)
      return []
    }
  }

  /**
   * Vincular grupo a um produto
   */
  const vincularGrupoAoProduto = async (dados: NovoProdutoGrupoComplemento): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('produto_grupos_complementos')
        .insert([dados])

      if (error) throw error
      return true
    } catch (e: any) {
      console.error('Erro ao vincular grupo ao produto:', e)
      return false
    }
  }

  /**
   * Desvincular grupo de um produto
   */
  const desvincularGrupoDoProduto = async (produtoId: string, grupoId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('produto_grupos_complementos')
        .delete()
        .eq('produto_id', produtoId)
        .eq('grupo_id', grupoId)

      if (error) throw error
      return true
    } catch (e: any) {
      console.error('Erro ao desvincular grupo do produto:', e)
      return false
    }
  }

  /**
   * Atualizar grupos de um produto (remove todos e adiciona os novos)
   */
  const atualizarGruposDoProduto = async (produtoId: string, gruposIds: string[]): Promise<boolean> => {
    try {
      // 1. Remover todos os grupos atuais
      await supabase
        .from('produto_grupos_complementos')
        .delete()
        .eq('produto_id', produtoId)

      // 2. Adicionar os novos grupos
      if (gruposIds.length > 0) {
        const novosVinculos = gruposIds.map((grupoId, index) => ({
          produto_id: produtoId,
          grupo_id: grupoId,
          ordem: index
        }))

        const { error } = await supabase
          .from('produto_grupos_complementos')
          .insert(novosVinculos)

        if (error) throw error
      }

      return true
    } catch (e: any) {
      console.error('Erro ao atualizar grupos do produto:', e)
      return false
    }
  }

  return {
    // Estado
    state,
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    grupos: computed(() => state.value.grupos),

    // Grupos
    buscarGrupos,
    buscarGrupoPorId,
    criarGrupo,
    atualizarGrupo,
    excluirGrupo,

    // Complementos
    buscarComplementosPorGrupo,
    criarComplemento,
    atualizarComplemento,
    excluirComplemento,

    // Produto <-> Grupos
    buscarGruposDoProduto,
    vincularGrupoAoProduto,
    desvincularGrupoDoProduto,
    atualizarGruposDoProduto
  }
}
