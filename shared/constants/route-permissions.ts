/**
 * Mapeamento de Rotas → Permissões Necessárias
 * 
 * Define qual permissão é necessária para acessar cada rota.
 * Se valor for `null`, a rota é acessível para todos os usuários autenticados.
 * 
 * Estrutura:
 * - modulo: módulo do sistema (pedidos, cardapio, relatorios, etc)
 * - acao: ação específica dentro do módulo
 * 
 * Este mapeamento é usado por:
 * 1. Middleware de permissões (bloqueia acesso à rota)
 * 2. Menu lateral (oculta itens sem permissão)
 */

export interface RoutePermission {
  modulo: 'pedidos' | 'cardapio' | 'relatorios' | 'configuracoes' | 'financeiro'
  acao: string
  descricao?: string
}

export const ROUTE_PERMISSIONS: Record<string, RoutePermission | null> = {
  // Dashboard - Requer visualizar relatórios (contém dados financeiros)
  '/': {
    modulo: 'relatorios',
    acao: 'visualizar',
    descricao: 'Dashboard com estatísticas e dados financeiros'
  },
  
  // Pedidos - Requer visualizar pedidos
  '/pedidos': {
    modulo: 'pedidos',
    acao: 'visualizar',
    descricao: 'Visualizar e gerenciar pedidos'
  },
  
  // Cardápio - Requer permissão de criar produto (admin/gerente)
  '/cardapio': {
    modulo: 'cardapio',
    acao: 'criar_produto',
    descricao: 'Gerenciar produtos do cardápio'
  },
  
  // Clientes - Requer visualizar valores financeiros (atendentes e acima)
  '/clientes': {
    modulo: 'financeiro',
    acao: 'visualizar_valores',
    descricao: 'Visualizar e gerenciar clientes'
  },
  
  // Cupons - Requer gerenciar usuários (apenas admin/proprietário)
  '/cupons': {
    modulo: 'configuracoes',
    acao: 'gerenciar_usuarios',
    descricao: 'Gerenciar cupons de desconto'
  },
  
  // Relatórios - Requer visualizar relatórios
  '/relatorios': {
    modulo: 'relatorios',
    acao: 'visualizar',
    descricao: 'Visualizar relatórios e estatísticas'
  },
  
  // Configurações - Requer editar empresa (admin/proprietário)
  '/configuracoes': {
    modulo: 'configuracoes',
    acao: 'editar_empresa',
    descricao: 'Editar configurações da empresa'
  },
  
  // Usuários - Requer gerenciar usuários (apenas admin/proprietário)
  '/usuarios': {
    modulo: 'configuracoes',
    acao: 'gerenciar_usuarios',
    descricao: 'Gerenciar usuários e permissões'
  },
  
  // Ajuda - Requer visualizar valores (atendentes e acima) 
  '/ajuda': {
    modulo: 'financeiro',
    acao: 'visualizar_valores',
    descricao: 'Central de ajuda e suporte'
  },
  
  // Páginas especiais - Sempre acessível
  '/acesso-negado': null,
  '/obrigado': null
} as const

/**
 * Verifica se uma rota requer permissões específicas
 */
export function routeRequiresPermission(path: string): boolean {
  const permission = ROUTE_PERMISSIONS[path]
  return permission !== null && permission !== undefined
}

/**
 * Obtém a permissão necessária para uma rota
 */
export function getRoutePermission(path: string): RoutePermission | null {
  return ROUTE_PERMISSIONS[path] || null
}

/**
 * Lista de rotas que não devem aparecer no menu
 */
export const HIDDEN_ROUTES = [
  '/acesso-negado',
  '/obrigado',
  '/login',
  '/recuperar-senha',
  '/redefinir-senha'
]
