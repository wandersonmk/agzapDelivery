export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.client) {
    console.log('🏢 Plugin Empresa: Iniciando busca...')
    
    // Aguardar o auth estar pronto
    const { isAuthenticated, isLoading } = useAuth()
    
    // Aguarda autenticação estar pronta
    let tentativas = 0
    while (isLoading.value && tentativas < 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      tentativas++
    }
    
    // Se está autenticado, busca empresa
    if (isAuthenticated.value) {
      try {
        const { buscarNomeEmpresa } = useEmpresa()
        await buscarNomeEmpresa()
        console.log('🏢 Plugin Empresa: Busca concluída com sucesso')
      } catch (error) {
        console.error('🏢 Plugin Empresa: Erro ao buscar:', error)
      }
    } else {
      console.log('🏢 Plugin Empresa: Usuário não autenticado, pulando busca')
    }
  }
})
