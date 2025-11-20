export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, nome } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email é obrigatório'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey

    // Obter URL base da requisição
    const headers = getHeaders(event)
    const host = headers.host || 'localhost:3000'
    const protocol = headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https')
    const baseUrl = `${protocol}://${host}`
    const redirectUrl = `${baseUrl}/completar-cadastro`

    console.log('[generate-invite-link] Gerando link com redirect:', redirectUrl)

    // 1. Criar usuário primeiro (necessário para generate_link)
    try {
      await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          email,
          email_confirm: false, // Usuário precisa confirmar
          user_metadata: {
            nome: nome || ''
          }
        }
      })
      console.log('[generate-invite-link] Usuário criado')
    } catch (createError: any) {
      // Se já existir (422), continuar para gerar o link
      if (createError.response?.status !== 422) {
        console.error('[generate-invite-link] Erro ao criar usuário:', createError)
        throw createError
      }
      console.log('[generate-invite-link] Usuário já existe, gerando link...')
    }

    // 2. Gerar token de convite
    const response = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        type: 'invite',
        email,
        options: {
          redirect_to: redirectUrl
        }
      }
    })

    console.log('[generate-invite-link] Link gerado:', response)

    return {
      success: true,
      link: response.action_link,
      email: email
    }

  } catch (error: any) {
    console.error('[generate-invite-link] Erro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erro ao gerar link'
    })
  }
})
