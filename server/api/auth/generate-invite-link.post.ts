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

    // 1. Verificar se usuário já existe
    let usuarioId = null
    try {
      // Buscar usuário pelo email usando list users
      const listResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      })
      
      // Procurar o usuário pelo email
      const usuarioExistente = listResponse.users?.find((u: any) => u.email === email)
      
      if (usuarioExistente) {
        console.log('[generate-invite-link] Usuário já existe:', usuarioExistente.id)
        usuarioId = usuarioExistente.id
      }
    } catch (error) {
      console.log('[generate-invite-link] Erro ao buscar usuário, tentando criar...')
    }

    // 2. Criar usuário apenas se não existir
    if (!usuarioId) {
      try {
        const createResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: {
            email,
            email_confirm: false,
            user_metadata: {
              nome: nome || ''
            }
          }
        })
        console.log('[generate-invite-link] Usuário criado com sucesso:', createResponse.id)
        usuarioId = createResponse.id
      } catch (createError: any) {
        // Se falhar, tenta gerar link mesmo assim
        console.log('[generate-invite-link] Erro ao criar usuário, tentando gerar link...')
      }
    }

    // 3. Gerar token de convite
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
