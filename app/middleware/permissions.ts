/**
 * Middleware de Permissões
 * 
 * Intercepta navegação e verifica se usuário tem permissão para acessar a rota.
 * Baseado no sistema de permissões da tabela usuarios_empresas.
 * 
 * Funciona em conjunto com:
 * - useEmpresa() composable (carrega permissões)
 * - ROUTE_PERMISSIONS (mapeamento de rotas)
 */

import { getRoutePermission } from '@shared/constants/route-permissions'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // No servidor, não executa verificação de permissões
  if (process.server) {
    return
  }

  console.log('[Permissions Middleware] Verificando acesso para:', to.path)

  // Obter permissão necessária para a rota
  const requiredPermission = getRoutePermission(to.path)

  // Se rota não requer permissão específica, libera acesso
  if (!requiredPermission) {
    console.log('[Permissions Middleware] Rota pública, acesso liberado')
    return
  }

  try {
    const { empresaAtual, temPermissao, buscarNomeEmpresa } = useEmpresa()

    // Se empresa ainda não foi carregada, tenta buscar
    if (!empresaAtual.value) {
      console.log('[Permissions Middleware] Empresa não carregada, buscando...')
      
      try {
        await buscarNomeEmpresa()
        // Aguarda um pouco após buscar
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error('[Permissions Middleware] Erro ao buscar empresa:', error)
      }
    }

    // Se ainda não tem empresa depois de buscar, aguarda um pouco mais
    if (!empresaAtual.value) {
      console.log('[Permissions Middleware] Aguardando empresa carregar...')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Se ainda não tem empresa, libera acesso apenas para /pedidos
    if (!empresaAtual.value) {
      console.warn('[Permissions Middleware] Empresa não carregada')
      
      // Se está tentando ir para /pedidos, libera temporariamente
      if (to.path === '/pedidos') {
        console.log('[Permissions Middleware] ⚠️ Liberando acesso temporário a /pedidos (empresa não carregada)')
        return
      }
      
      // Para outras rotas, redireciona para pedidos
      console.log('[Permissions Middleware] Redirecionando para /pedidos')
      return navigateTo('/pedidos')
    }

    console.log('[Permissions Middleware] Verificando permissão:', {
      modulo: requiredPermission.modulo,
      acao: requiredPermission.acao,
      empresaAtual: empresaAtual.value.nome,
      papel: empresaAtual.value.papel
    })

    // Verifica se usuário tem a permissão necessária
    const hasPermission = temPermissao(requiredPermission.modulo, requiredPermission.acao)

    if (!hasPermission) {
      console.warn('[Permissions Middleware] Acesso negado! Usuário não tem permissão:', {
        modulo: requiredPermission.modulo,
        acao: requiredPermission.acao,
        papel: empresaAtual.value.papel
      })

      // Se não tem permissão para dashboard, redireciona para pedidos
      if (to.path === '/') {
        return navigateTo('/pedidos')
      }

      // Para outras rotas, redireciona para página de acesso negado
      return navigateTo('/acesso-negado')
    }

    console.log('[Permissions Middleware] ✅ Acesso permitido')
  } catch (error) {
    console.error('[Permissions Middleware] Erro ao verificar permissões:', error)
    
    // Em caso de erro, redireciona para página de acesso negado
    return navigateTo('/acesso-negado')
  }
})
