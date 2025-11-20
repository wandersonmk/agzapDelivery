export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email é obrigatório'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey

    // Gerar token de convite
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
          redirect_to: process.env.NODE_ENV === 'production'
            ? 'https://agzap-delivery.vercel.app/completar-cadastro'
            : 'http://localhost:3001/completar-cadastro'
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
