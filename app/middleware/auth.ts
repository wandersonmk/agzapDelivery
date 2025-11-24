export default defineNuxtRouteMiddleware(async (to, from) => {
  // Rotas públicas que não precisam de autenticação
  const rotasPublicas = ['/cardapio']
  const ehRotaPublica = rotasPublicas.some(rota => to.path.startsWith(rota))
  
  if (ehRotaPublica) {
    console.log('[Auth Middleware] Rota pública, permitindo acesso:', to.path)
    return
  }
  
  // No servidor, não precisa verificar autenticação detalhada
  if (process.server) {
    return
  }
  
  try {
    const supabase = useSupabaseClient()
    
    // Verificação direta da sessão
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('[Auth Middleware] Usuário não autenticado, redirecionando para login')
      return navigateTo('/login')
    }
    
    console.log('[Auth Middleware] Usuário autenticado:', session.user.email)
    
    // Verificar se o usuário está ativo
    const { data: vinculo } = await supabase
      .from('usuarios_empresas')
      .select('ativo')
      .eq('usuario_id', session.user.id)
      .single()
    
    // Se usuário está desativado e não está na página de conta desativada
    if (vinculo && !vinculo.ativo && to.path !== '/conta-desativada') {
      console.log('[Auth Middleware] Usuário desativado, redirecionando')
      return navigateTo('/conta-desativada')
    }
    
    // Se usuário está ativo mas está na página de conta desativada
    if (vinculo && vinculo.ativo && to.path === '/conta-desativada') {
      console.log('[Auth Middleware] Usuário reativado, redirecionando para dashboard')
      return navigateTo('/pedidos')
    }
  } catch (error) {
    console.error('[Auth Middleware] Erro:', error)
    return navigateTo('/login')
  }
})
