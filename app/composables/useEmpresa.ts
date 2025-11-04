import type { 
  EmpresaDisponivel, 
  PapelUsuario, 
  Permissoes,
  UsuarioEmpresaComDados 
} from '@shared/types/usuarios-empresas.types'

// Interface para configurações da empresa
export interface EmpresaConfig {
  id?: string
  nome: string
  endereco: string | null
  telefone: string | null
  logotipo: string | null
  cnpj?: string | null
  hora_abertura: string
  hora_fechamento: string
  tempo_estimado?: number
  aberto?: boolean
}

export function useEmpresa() {
  // Estados globais
  const empresaAtual = useState<EmpresaDisponivel | null>('empresa_atual', () => null)
  const empresasDisponiveis = useState<EmpresaDisponivel[]>('empresas_disponiveis', () => [])
  const isLoadingEmpresa = useState<boolean>('empresa_loading', () => false)

  // Computed para compatibilidade com código legado
  const nomeEmpresa = computed(() => empresaAtual.value?.nome || null)

  /**
   * Busca todas as empresas disponíveis para o usuário logado
   * através da tabela usuarios_empresas (relacionamento N:N)
   */
  async function buscarEmpresasDisponiveis(): Promise<EmpresaDisponivel[]> {
    if (!process.client) return []

    try {
      isLoadingEmpresa.value = true
      const supabase = useSupabaseClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user?.id) {
        console.log('[useEmpresa] Usuário não está logado')
        empresasDisponiveis.value = []
        return []
      }

      console.log('[useEmpresa] Buscando empresas para usuário:', user.id)
      
      // Busca vínculos ativos através da tabela usuarios_empresas
      const { data: vinculos, error } = await supabase
        .from('usuarios_empresas')
        .select(`
          id,
          papel,
          permissoes,
          empresas (
            id,
            nome,
            logotipo,
            endereco,
            telefone,
            aberto
          )
        `)
        .eq('usuario_id', user.id)
        .eq('ativo', true) as { data: UsuarioEmpresaComDados[] | null, error: any }

      if (error) {
        console.error('[useEmpresa] Erro ao buscar empresas:', error)
        empresasDisponiveis.value = []
        return []
      }

      if (!vinculos || vinculos.length === 0) {
        console.log('[useEmpresa] Nenhuma empresa encontrada para o usuário')
        empresasDisponiveis.value = []
        return []
      }

      // Mapear para formato EmpresaDisponivel
      const empresas: EmpresaDisponivel[] = vinculos
        .filter(v => v.empresas) // Garantir que empresa existe
        .map(vinculo => ({
          id: vinculo.empresas!.id,
          nome: vinculo.empresas!.nome,
          logo: vinculo.empresas!.logotipo || undefined,
          endereco: vinculo.empresas!.endereco || undefined,
          telefone: vinculo.empresas!.telefone || undefined,
          aberto: vinculo.empresas!.aberto,
          papel: vinculo.papel,
          permissoes: vinculo.permissoes,
          vinculoId: vinculo.id
        }))

      empresasDisponiveis.value = empresas
      
      // Se não há empresa selecionada, seleciona a primeira
      if (!empresaAtual.value && empresas.length > 0) {
        const primeiraEmpresa = empresas[0]
        if (primeiraEmpresa) {
          empresaAtual.value = primeiraEmpresa
          // Salvar no localStorage
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('empresa_atual_id', primeiraEmpresa.id)
          }
        }
      }

      console.log(`[useEmpresa] ${empresas.length} empresa(s) encontrada(s)`)
      return empresas
      
    } catch (err) {
      console.error('[useEmpresa] Erro:', err)
      empresasDisponiveis.value = []
      return []
    } finally {
      isLoadingEmpresa.value = false
    }
  }

  /**
   * Seleciona uma empresa específica como ativa
   */
  function selecionarEmpresa(empresaId: string) {
    const empresa = empresasDisponiveis.value.find(e => e.id === empresaId)
    if (empresa) {
      empresaAtual.value = empresa
      // Salvar no localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('empresa_atual_id', empresaId)
      }
      console.log('[useEmpresa] Empresa selecionada:', empresa.nome)
    }
  }

  /**
   * Busca o nome da empresa (compatibilidade com código legado)
   */
  async function buscarNomeEmpresa() {
    await buscarEmpresasDisponiveis()
  }

  /**
   * Função para obter o ID da empresa atual
   * RETRO-COMPATÍVEL: funciona com código antigo
   */
  async function getEmpresaId(): Promise<string | null> {
    if (!process.client) return null

    // Se já tem empresa selecionada, retorna o ID
    if (empresaAtual.value) {
      return empresaAtual.value.id
    }

    // Se não tem, busca empresas disponíveis
    const empresas = await buscarEmpresasDisponiveis()
    
    // Retorna ID da primeira empresa (comportamento padrão)
    return empresas.length > 0 && empresas[0] ? empresas[0].id : null
  }

  /**
   * Buscar todas as configurações da empresa atual
   */
  async function buscarConfiguracoes(): Promise<EmpresaConfig | null> {
    if (!process.client) return null

    const empresaId = await getEmpresaId()
    if (!empresaId) return null

    try {
      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, endereco, telefone, logotipo, cnpj, hora_abertura, hora_fechamento, tempo_estimado, aberto')
        .eq('id', empresaId)
        .single()

      if (error) {
        console.error('[useEmpresa] Erro ao buscar configurações:', error)
        return null
      }

      return data as EmpresaConfig
      
    } catch (err) {
      console.error('[useEmpresa] Erro ao buscar configurações:', err)
      return null
    }
  }

  /**
   * Salvar configurações da empresa atual
   */
  async function salvarConfiguracoes(config: Partial<EmpresaConfig>): Promise<boolean> {
    if (!process.client) return false

    const empresaId = await getEmpresaId()
    if (!empresaId) return false

    try {
      const supabase = useSupabaseClient()

      const { error } = await supabase
        .from('empresas')
        .update(config)
        .eq('id', empresaId)

      if (error) {
        console.error('[useEmpresa] Erro ao salvar configurações:', error)
        return false
      }

      // Atualiza o nome da empresa no estado global se foi modificado
      if (config.nome && empresaAtual.value) {
        empresaAtual.value.nome = config.nome
      }

      console.log('[useEmpresa] Configurações salvas com sucesso')
      return true
      
    } catch (err) {
      console.error('[useEmpresa] Erro ao salvar configurações:', err)
      return false
    }
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  function temPermissao(modulo: keyof Permissoes, acao: string): boolean {
    if (!empresaAtual.value) return false
    
    const moduloPermissoes = empresaAtual.value.permissoes[modulo] as any
    return moduloPermissoes?.[acao] === true
  }

  /**
   * Verifica se usuário tem um dos papéis especificados
   */
  function temPapel(...papeis: PapelUsuario[]): boolean {
    if (!empresaAtual.value) return false
    return papeis.includes(empresaAtual.value.papel)
  }

  return {
    // Estados
    empresaAtual: readonly(empresaAtual),
    empresasDisponiveis: readonly(empresasDisponiveis),
    nomeEmpresa, // Computed - compatibilidade
    isLoadingEmpresa: readonly(isLoadingEmpresa),
    
    // Funções principais
    buscarEmpresasDisponiveis,
    selecionarEmpresa,
    buscarNomeEmpresa, // Compatibilidade
    getEmpresaId, // Compatibilidade melhorada
    buscarConfiguracoes,
    salvarConfiguracoes,
    
    // Funções de permissão
    temPermissao,
    temPapel
  }
}
