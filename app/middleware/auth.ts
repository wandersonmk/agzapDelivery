export default defineNuxtRouteMiddleware(async (to, from) => {
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
  } catch (error) {
    console.error('[Auth Middleware] Erro:', error)
    return navigateTo('/login')
  }
})
