/**
 * Tipos relacionados ao sistema N:N de Usuários e Empresas
 * Permite múltiplos usuários por empresa e múltiplas empresas por usuário
 */

// ============================================
// ENUMS E TIPOS BASE
// ============================================

/**
 * Papéis disponíveis para usuários dentro de uma empresa
 */
export type PapelUsuario = 
  | 'proprietario'  // Dono da empresa, acesso total
  | 'admin'         // Administrador, quase acesso total
  | 'gerente'       // Gerente, acesso a relatórios e configurações
  | 'atendente'     // Atendente, foco em pedidos
  | 'cozinha'       // Cozinha, visualiza pedidos em andamento
  | 'entregador'    // Entregador, visualiza pedidos para entrega

/**
 * Estrutura de permissões granulares por módulo
 */
export interface Permissoes {
  pedidos: {
    criar: boolean
    editar: boolean
    excluir: boolean
    visualizar: boolean
    alterar_status: boolean
  }
  cardapio: {
    criar_produto: boolean
    editar_produto: boolean
    excluir_produto: boolean
    ativar_desativar: boolean
  }
  relatorios: {
    visualizar: boolean
    exportar: boolean
  }
  configuracoes: {
    editar_empresa: boolean
    gerenciar_usuarios: boolean
  }
  financeiro: {
    visualizar_valores: boolean
    gerar_relatorios: boolean
  }
}

/**
 * Permissões padrão por papel
 */
export const PERMISSOES_PADRAO: Record<PapelUsuario, Permissoes> = {
  proprietario: {
    pedidos: { criar: true, editar: true, excluir: true, visualizar: true, alterar_status: true },
    cardapio: { criar_produto: true, editar_produto: true, excluir_produto: true, ativar_desativar: true },
    relatorios: { visualizar: true, exportar: true },
    configuracoes: { editar_empresa: true, gerenciar_usuarios: true },
    financeiro: { visualizar_valores: true, gerar_relatorios: true }
  },
  admin: {
    pedidos: { criar: true, editar: true, excluir: true, visualizar: true, alterar_status: true },
    cardapio: { criar_produto: true, editar_produto: true, excluir_produto: true, ativar_desativar: true },
    relatorios: { visualizar: true, exportar: true },
    configuracoes: { editar_empresa: true, gerenciar_usuarios: true },
    financeiro: { visualizar_valores: true, gerar_relatorios: true }
  },
  gerente: {
    pedidos: { criar: true, editar: true, excluir: false, visualizar: true, alterar_status: true },
    cardapio: { criar_produto: true, editar_produto: true, excluir_produto: false, ativar_desativar: true },
    relatorios: { visualizar: true, exportar: true },
    configuracoes: { editar_empresa: false, gerenciar_usuarios: false },
    financeiro: { visualizar_valores: true, gerar_relatorios: true }
  },
  atendente: {
    pedidos: { criar: true, editar: true, excluir: false, visualizar: true, alterar_status: true },
    cardapio: { criar_produto: false, editar_produto: false, excluir_produto: false, ativar_desativar: false },
    relatorios: { visualizar: false, exportar: false },
    configuracoes: { editar_empresa: false, gerenciar_usuarios: false },
    financeiro: { visualizar_valores: true, gerar_relatorios: false }
  },
  cozinha: {
    pedidos: { criar: false, editar: false, excluir: false, visualizar: true, alterar_status: true },
    cardapio: { criar_produto: false, editar_produto: false, excluir_produto: false, ativar_desativar: false },
    relatorios: { visualizar: false, exportar: false },
    configuracoes: { editar_empresa: false, gerenciar_usuarios: false },
    financeiro: { visualizar_valores: false, gerar_relatorios: false }
  },
  entregador: {
    pedidos: { criar: false, editar: false, excluir: false, visualizar: true, alterar_status: true },
    cardapio: { criar_produto: false, editar_produto: false, excluir_produto: false, ativar_desativar: false },
    relatorios: { visualizar: false, exportar: false },
    configuracoes: { editar_empresa: false, gerenciar_usuarios: false },
    financeiro: { visualizar_valores: false, gerar_relatorios: false }
  }
}

/**
 * Labels amigáveis para os papéis
 */
export const PAPEL_LABELS: Record<PapelUsuario, string> = {
  proprietario: 'Proprietário',
  admin: 'Administrador',
  gerente: 'Gerente',
  atendente: 'Atendente',
  cozinha: 'Cozinha',
  entregador: 'Entregador'
}

// ============================================
// INTERFACES DO BANCO DE DADOS
// ============================================

/**
 * Estrutura da tabela usuarios_empresas (Supabase)
 */
export interface UsuarioEmpresaDB {
  id: string
  usuario_id: string
  empresa_id: string
  papel: PapelUsuario
  permissoes: Permissoes
  ativo: boolean
  created_at: string
  updated_at: string
}

/**
 * Estrutura enriquecida com dados de JOIN
 */
export interface UsuarioEmpresaComDados extends UsuarioEmpresaDB {
  usuarios?: {
    id: string
    nome: string
    email: string
    foto: string | null
    perfil: string
  }
  empresas?: {
    id: string
    nome: string
    endereco: string | null
    telefone: string | null
    logotipo: string | null
    aberto: boolean
  }
}

// ============================================
// TIPOS PARA O FRONTEND
// ============================================

/**
 * Vínculo usuário-empresa formatado para uso no frontend
 */
export interface VinculoUsuarioEmpresa {
  id: string
  empresaId: string
  empresaNome: string
  empresaLogo?: string
  papel: PapelUsuario
  papelLabel: string
  permissoes: Permissoes
  ativo: boolean
  vinculadoEm: Date
}

/**
 * Empresa disponível para o usuário logado
 */
export interface EmpresaDisponivel {
  id: string
  nome: string
  logo?: string
  endereco?: string
  telefone?: string
  aberto: boolean
  papel: PapelUsuario
  permissoes: Permissoes
  vinculoId: string
}

/**
 * Usuário vinculado a uma empresa (para gerenciamento)
 */
export interface UsuarioVinculado {
  vinculoId: string
  usuarioId: string
  usuarioNome: string
  usuarioEmail: string
  usuarioFoto?: string
  papel: PapelUsuario
  papelLabel: string
  ativo: boolean
  vinculadoEm: Date
}

/**
 * Payload para criar novo vínculo usuário-empresa
 */
export interface CriarVinculoPayload {
  usuario_id: string
  empresa_id: string
  papel: PapelUsuario
  permissoes?: Partial<Permissoes> // Se não fornecido, usa permissões padrão do papel
}

/**
 * Payload para atualizar vínculo existente
 */
export interface AtualizarVinculoPayload {
  papel?: PapelUsuario
  permissoes?: Partial<Permissoes>
  ativo?: boolean
}
