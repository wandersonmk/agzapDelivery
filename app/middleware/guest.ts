export default defineNuxtRouteMiddleware(async (to, from) => {
  // No servidor, não precisa verificar autenticação detalhada
  if (process.server) {
    return
  }
  
  try {
    const supabase = useSupabaseClient()
    
    // Verificação direta da sessão
    const { data: { session } } = await supabase.auth.getSession()
    
    // Se já está autenticado, redireciona para home
    if (session) {
      console.log('Guest middleware: Usuário já autenticado, redirecionando para /')
      return navigateTo('/')
    }
    
    console.log('Guest middleware: Sem sessão, permitindo acesso')
  } catch (error) {
    console.error('Erro no middleware guest:', error)
    // Em caso de erro, permite acesso à página
  }
})
