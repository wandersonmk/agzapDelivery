export default defineEventHandler(async (event) => {
  try {
    // Ler body da requisição
    const body = await readBody(event)
    const { email, name } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email é obrigatório'
      })
    }

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nome é obrigatório'
      })
    }

    // Pegar configurações
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey // Private key do servidor

    if (!serviceRoleKey) {
      console.error('[invite.post] SERVICE_ROLE_KEY não configurada!')
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuração do servidor incompleta. Adicione NUXT_SUPABASE_SERVICE_ROLE_KEY no arquivo .env'
      })
    }

    console.log('[invite.post] Enviando convite para:', email)
    console.log('[invite.post] Supabase URL:', supabaseUrl)
    console.log('[invite.post] Service Role Key configurada:', !!serviceRoleKey)

    // URL de redirect para completar cadastro
    const redirectTo = process.env.NODE_ENV === 'production'
      ? 'https://agzap-delivery.vercel.app/completar-cadastro'
      : 'http://localhost:3000/completar-cadastro'

    console.log('[invite.post] Redirect URL:', redirectTo)

    // Fazer chamada ao Supabase Auth Admin API
    const response = await $fetch(`${supabaseUrl}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        email,
        data: {
          name: name,
          email_confirm: true,
          redirect_to: redirectTo
        }
      }
    })

    console.log('[invite.post] Convite enviado com sucesso:', response)

    return {
      success: true,
      data: response
    }

  } catch (error: any) {
    console.error('[invite.post] Erro ao enviar convite:', error)
    
    // Se for erro 403, significa que a SERVICE_ROLE_KEY não está configurada
    if (error.statusCode === 403 || error.status === 403) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro de permissão: Verifique se a NUXT_SUPABASE_SERVICE_ROLE_KEY está configurada corretamente no arquivo .env'
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erro ao enviar convite'
    })
  }
})
