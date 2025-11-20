export default defineEventHandler(async (event) => {
  try {
    console.log('[create-user-direct] ===== INÍCIO =====')
    
    const config = useRuntimeConfig()
    const body = await readBody(event)
    
    console.log('[create-user-direct] Body recebido:', {
      nome: body.nome,
      email: body.email,
      papel: body.papel,
      empresaId: body.empresaId,
      hasSenha: !!body.senha
    })

    // Validações
    if (!body.nome || !body.email || !body.senha) {
      return {
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      }
    }

    if (body.senha.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres'
      }
    }

    if (!body.empresaId) {
      return {
        success: false,
        message: 'ID da empresa não fornecido'
      }
    }

    // Verificar se tem as variáveis de ambiente
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceRoleKey

    console.log('[create-user-direct] Config:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceKey,
      urlStart: supabaseUrl?.substring(0, 20)
    })

    if (!supabaseUrl || !serviceKey) {
      console.error('[create-user-direct] Variáveis de ambiente faltando!')
      return {
        success: false,
        message: 'Erro de configuração do servidor'
      }
    }

    // Usar $fetch diretamente para ter mais controle
    const baseUrl = supabaseUrl.replace(/\/$/, '')
    
    console.log('[create-user-direct] Verificando se email já existe...')
    
    // 1. Verificar se usuário já existe
    try {
      const listResponse = await $fetch(`${baseUrl}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        }
      })

      const emailExists = (listResponse as any)?.users?.some((u: any) => u.email === body.email)
      
      if (emailExists) {
        console.log('[create-user-direct] Email já existe')
        return {
          success: false,
          message: 'Já existe um usuário com este email'
        }
      }
    } catch (listError: any) {
      console.error('[create-user-direct] Erro ao listar usuários:', listError)
      // Continua mesmo com erro na listagem
    }

    console.log('[create-user-direct] Criando usuário no Auth...')
    
    // 2. Criar usuário
    const createUserResponse = await $fetch(`${baseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        email: body.email,
        password: body.senha,
        email_confirm: true,
        user_metadata: {
          nome: body.nome
        }
      }
    })

    const userId = (createUserResponse as any)?.id
    
    if (!userId) {
      console.error('[create-user-direct] Usuário criado mas sem ID:', createUserResponse)
      return {
        success: false,
        message: 'Erro ao criar usuário: ID não retornado'
      }
    }

    console.log('[create-user-direct] Usuário criado no Auth:', userId)

    // 3. Criar registro na tabela usuarios
    console.log('[create-user-direct] Criando registro na tabela usuarios...')
    
    try {
      const insertUsuarioResponse = await $fetch(`${baseUrl}/rest/v1/usuarios`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: {
          id: userId,
          nome: body.nome,
          email: body.email
        }
      })

      console.log('[create-user-direct] Registro de usuário criado')
    } catch (usuarioError: any) {
      console.error('[create-user-direct] Erro ao criar registro de usuário:', {
        message: usuarioError.message,
        data: usuarioError.data,
        status: usuarioError.statusCode
      })
      
      // Se der erro, tenta deletar o usuário criado no Auth
      try {
        await $fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        })
        console.log('[create-user-direct] Usuário deletado do Auth após falha')
      } catch (deleteError) {
        console.error('[create-user-direct] Erro ao deletar usuário do Auth:', deleteError)
      }
      
      throw new Error(`Erro ao criar registro de usuário: ${usuarioError.data?.message || usuarioError.message}`)
    }

    // 4. Criar vínculo com empresa
    console.log('[create-user-direct] Criando vínculo com empresa...')
    console.log('[create-user-direct] Dados do vínculo:', {
      usuario_id: userId,
      empresa_id: body.empresaId,
      papel: body.papel,
      temPermissoes: !!body.permissoes
    })
    
    try {
      const insertVinculoResponse = await $fetch(`${baseUrl}/rest/v1/usuarios_empresas`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: {
          usuario_id: userId,
          empresa_id: body.empresaId,
          papel: body.papel,
          permissoes: body.permissoes,
          ativo: true
        }
      })

      console.log('[create-user-direct] Vínculo criado com sucesso!', insertVinculoResponse)
    } catch (vinculoError: any) {
      console.error('[create-user-direct] Erro ao criar vínculo usuário-empresa:', {
        message: vinculoError.message,
        data: vinculoError.data,
        status: vinculoError.statusCode,
        details: vinculoError.data?.details
      })
      
      // Se der erro, faz rollback completo
      try {
        await $fetch(`${baseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        })
        await $fetch(`${baseUrl}/auth/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          }
        })
        console.log('[create-user-direct] Rollback completo realizado')
      } catch (rollbackError) {
        console.error('[create-user-direct] Erro no rollback:', rollbackError)
      }
      
      throw new Error(`Erro ao vincular usuário à empresa: ${vinculoError.data?.message || vinculoError.message}`)
    }
    
    console.log('[create-user-direct] ===== FIM =====')

    return {
      success: true,
      usuario: {
        id: userId,
        nome: body.nome,
        email: body.email,
        papel: body.papel,
        empresaId: body.empresaId
      }
    }

  } catch (error: any) {
    console.error('[create-user-direct] ===== ERRO =====')
    console.error('[create-user-direct] Erro completo:', error)
    console.error('[create-user-direct] Mensagem:', error.message)
    console.error('[create-user-direct] Status:', error.statusCode)
    console.error('[create-user-direct] Data:', error.data)
    
    return {
      success: false,
      message: error.data?.message || error.message || 'Erro ao criar usuário'
    }
  }
})
