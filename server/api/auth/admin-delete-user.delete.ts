export default defineEventHandler(async (event) => {
  try {
    const { userId } = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'userId é obrigatório'
      })
    }

    console.log('[admin-delete-user] Deletando usuário do auth.users:', userId)

    // Obter configurações do ambiente
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRole

    // Fazer chamada direta à Admin API do Supabase Auth
    const response = await $fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('[admin-delete-user] Usuário excluído com sucesso do auth.users')

    return {
      success: true,
      message: 'Usuário excluído com sucesso do auth.users'
    }
  } catch (error: any) {
    console.error('[admin-delete-user] Erro ao excluir usuário do auth:', error)
    
    // Se for erro 404, o usuário já foi excluído
    if (error.statusCode === 404) {
      return {
        success: true,
        message: 'Usuário já foi excluído anteriormente'
      }
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir usuário do auth'
    })
  }
})
