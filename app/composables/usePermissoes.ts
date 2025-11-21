import type { Permissoes } from '@shared/types/usuarios-empresas.types'

/**
 * Composable para verificar permissões do usuário logado
 * Garante que o sistema respeite rigorosamente as permissões configuradas
 */
export function usePermissoes() {
  const { user } = useAuth()
  const { getPermissoes } = useEmpresa()

  /**
   * Obtém as permissões atuais do usuário
   */
  const getPermissoesAtuais = async (): Promise<Permissoes | null> => {
    try {
      return await getPermissoes()
    } catch (error) {
      console.error('[usePermissoes] Erro ao obter permissões:', error)
      return null
    }
  }

  /**
   * Verifica se o usuário pode CRIAR pedidos
   */
  const podeVerPedidos = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.pedidos.visualizar ?? false
  }

  /**
   * Verifica se o usuário pode CRIAR pedidos
   */
  const podeCriarPedido = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.pedidos.criar ?? false
  }

  /**
   * Verifica se o usuário pode EDITAR pedidos
   */
  const podeEditarPedido = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.pedidos.editar ?? false
  }

  /**
   * Verifica se o usuário pode EXCLUIR pedidos
   */
  const podeExcluirPedido = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.pedidos.excluir ?? false
  }

  /**
   * Verifica se o usuário pode ALTERAR STATUS de pedidos
   */
  const podeAlterarStatusPedido = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.pedidos.alterar_status ?? false
  }

  /**
   * Verifica se o usuário pode CRIAR produtos no cardápio
   */
  const podeCriarProduto = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.cardapio.criar_produto ?? false
  }

  /**
   * Verifica se o usuário pode EDITAR produtos no cardápio
   */
  const podeEditarProduto = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.cardapio.editar_produto ?? false
  }

  /**
   * Verifica se o usuário pode EXCLUIR produtos no cardápio
   */
  const podeExcluirProduto = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.cardapio.excluir_produto ?? false
  }

  /**
   * Verifica se o usuário pode ATIVAR/DESATIVAR produtos
   */
  const podeAtivarDesativarProduto = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.cardapio.ativar_desativar ?? false
  }

  /**
   * Verifica se o usuário pode VISUALIZAR relatórios
   */
  const podeVisualizarRelatorios = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.relatorios.visualizar ?? false
  }

  /**
   * Verifica se o usuário pode EXPORTAR relatórios
   */
  const podeExportarRelatorios = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.relatorios.exportar ?? false
  }

  /**
   * Verifica se o usuário pode EDITAR dados da empresa
   */
  const podeEditarEmpresa = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.configuracoes.editar_empresa ?? false
  }

  /**
   * Verifica se o usuário pode GERENCIAR usuários
   */
  const podeGerenciarUsuarios = async (): Promise<boolean> => {
    const permissoes = await getPermissoesAtuais()
    return permissoes?.configuracoes.gerenciar_usuarios ?? false
  }

  /**
   * Versão síncrona - usa as permissões já carregadas (se disponíveis)
   * Útil para verificações rápidas em v-if
   */
  const permissoesSync = computed(() => {
    // Pega diretamente da empresa atual do useEmpresa
    const { empresaAtual } = useEmpresa()
    return empresaAtual.value?.permissoes || null
  })

  return {
    // Async (mais seguro, sempre busca atualizado)
    podeVerPedidos,
    podeCriarPedido,
    podeEditarPedido,
    podeExcluirPedido,
    podeAlterarStatusPedido,
    podeCriarProduto,
    podeEditarProduto,
    podeExcluirProduto,
    podeAtivarDesativarProduto,
    podeVisualizarRelatorios,
    podeExportarRelatorios,
    podeEditarEmpresa,
    podeGerenciarUsuarios,
    
    // Sync (para uso em templates)
    permissoesSync,
    
    // Util
    getPermissoesAtuais
  }
}
