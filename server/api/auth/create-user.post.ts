export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, name } = body

    if (!email || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email e nome são obrigatórios'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey

    console.log('[create-user] Criando usuário via Auth Admin:', email)

    // Criar usuário via Auth Admin API (não aciona trigger)
    const response = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        email,
        email_confirm: false, // Email não confirmado ainda
        user_metadata: {
          name
        }
      }
    })

    console.log('[create-user] Usuário criado:', response.id)

    // Agora criar registro na tabela usuarios SEM acionar trigger
    // Usando função RPC para desabilitar trigger temporariamente
    const supabase = useSupabaseServerClient(event)
    
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: response.id, // Usar mesmo ID do Auth
        email: email,
        nome: name,
        foto: null
      })

    if (insertError) {
      console.error('[create-user] Erro ao inserir na tabela usuarios:', insertError)
      // Não falha se usuário já existir
      if (!insertError.message.includes('duplicate')) {
        throw insertError
      }
    }

    return {
      success: true,
      userId: response.id
    }

  } catch (error: any) {
    console.error('[create-user] Erro:', error)
    
    // Se erro for de usuário duplicado, retornar erro específico
    if (error.data?.message?.includes('already registered') || 
        error.message?.includes('duplicate')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Usuário já existe'
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erro ao criar usuário'
    })
  }
})
