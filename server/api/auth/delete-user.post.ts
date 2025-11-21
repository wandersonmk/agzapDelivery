export default defineEventHandler(async (event) => {
  try {
    const { userId } = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'userId é obrigatório'
      })
    }

    // Cliente Supabase com service role
    const supabase = await serverSupabaseClient(event)

    // Excluir usuário do auth.users usando admin API
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('[delete-user] Erro ao excluir usuário do auth:', error)
      throw createError({
        statusCode: 500,
        message: `Erro ao excluir usuário: ${error.message}`
      })
    }

    console.log('[delete-user] Usuário excluído com sucesso:', userId)

    return {
      success: true,
      message: 'Usuário excluído com sucesso'
    }
  } catch (error: any) {
    console.error('[delete-user] Erro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir usuário'
    })
  }
})
