import { createClient } from '@supabase/supabase-js'
import type { PapelUsuario, PermissoesUsuario } from '~/shared/types/usuario'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Cliente admin do Supabase
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // 1. Pega os dados do body
    const body = await readBody(event)
    const { nome, email, senha, papel, permissoes } = body

    // Validações básicas
    if (!nome || !email || !senha) {
      throw createError({
        statusCode: 400,
        message: 'Nome, email e senha são obrigatórios'
      })
    }

    if (senha.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'A senha deve ter no mínimo 6 caracteres'
      })
    }

    // 2. Pega o usuário atual (admin) para saber a empresa
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Token de autenticação não fornecido'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !adminUser) {
      throw createError({
        statusCode: 401,
        message: 'Token inválido ou usuário não encontrado'
      })
    }

    // Busca a empresa do admin
    const { data: adminUsuario, error: adminError } = await supabaseAdmin
      .from('usuarios_empresas')
      .select('empresa_id')
      .eq('usuario_id', adminUser.id)
      .single()

    if (adminError || !adminUsuario) {
      throw createError({
        statusCode: 400,
        message: 'Não foi possível identificar a empresa do administrador'
      })
    }

    const empresaId = adminUsuario.empresa_id

    // 3. Verifica se o email já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(u => u.email === email)

    if (emailExists) {
      throw createError({
        statusCode: 409,
        message: 'Já existe um usuário com este email'
      })
    }

    // 4. Cria o usuário no auth.users com a senha fornecida
    const { data: newUser, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        nome
      }
    })

    if (userCreateError || !newUser.user) {
      console.error('Erro ao criar usuário:', userCreateError)
      throw createError({
        statusCode: 500,
        message: `Erro ao criar usuário: ${userCreateError?.message || 'Erro desconhecido'}`
      })
    }

    // 5. Cria o registro na tabela usuarios
    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: newUser.user.id,
        nome,
        email
      })

    if (usuarioError) {
      console.error('Erro ao criar registro de usuário:', usuarioError)
      // Tenta deletar o usuário criado no auth
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      throw createError({
        statusCode: 500,
        message: `Erro ao criar registro de usuário: ${usuarioError.message}`
      })
    }

    // 6. Cria a relação usuarios_empresas
    const { error: relacaoError } = await supabaseAdmin
      .from('usuarios_empresas')
      .insert({
        usuario_id: newUser.user.id,
        empresa_id: empresaId,
        papel: papel as PapelUsuario,
        permissoes: permissoes as PermissoesUsuario
      })

    if (relacaoError) {
      console.error('Erro ao criar relação usuário-empresa:', relacaoError)
      // Tenta deletar o usuário criado
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      await supabaseAdmin.from('usuarios').delete().eq('id', newUser.user.id)
      throw createError({
        statusCode: 500,
        message: `Erro ao vincular usuário à empresa: ${relacaoError.message}`
      })
    }

    // 7. Retorna sucesso
    return {
      success: true,
      usuario: {
        id: newUser.user.id,
        nome,
        email,
        papel,
        empresaId
      }
    }

  } catch (error: any) {
    console.error('Erro no endpoint create-user-direct:', error)
    
    // Se for um erro já tratado (createError), propaga
    if (error.statusCode) {
      throw error
    }

    // Caso contrário, retorna erro genérico
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao criar usuário'
    })
  }
})
