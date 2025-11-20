import type { PapelUsuario, Permissoes } from '@shared/types/usuarios-empresas.types'
import { PERMISSOES_PADRAO } from '@shared/types/usuarios-empresas.types'

interface ConviteUsuarioData {
  nome: string
  email: string
  papel: PapelUsuario
  permissoes: Permissoes
}

export function useUsuarios() {
  const supabase = useSupabaseClient()
  const { getEmpresaId } = useEmpresa()

  /**
   * Envia convite para novo usuário via Supabase Auth Admin API
   */
  async function enviarConvite(data: ConviteUsuarioData) {
    try {
      console.log('[useUsuarios] Enviando convite para:', data.email)

      // 1. Gerar link de convite direto (não envia email - será copiado para clipboard)
      let inviteLink: string | null = null
      try {
        const response = await $fetch<{ link: string }>('/api/auth/generate-invite-link', {
          method: 'POST',
          body: {
            email: data.email
          }
        })
        inviteLink = response.link
        console.log('[useUsuarios] Link de convite gerado:', inviteLink)
      } catch (inviteError: any) {
        console.warn('[useUsuarios] Aviso ao gerar link (continuando):', inviteError.message)
        // Continua mesmo se falhar
      }

      // 2. Verificar se usuário já existe
      const { data: usuarioExistente, error: errorBusca } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', data.email)
        .single()

      let usuarioId: string

      if (usuarioExistente) {
        // Usuário já existe
        usuarioId = usuarioExistente.id
        console.log('[useUsuarios] Usuário já existe:', usuarioId)
      } else {
        // 3. Criar registro na tabela usuarios (pendente até aceitar convite)
        const { data: novoUsuario, error: errorUsuario } = await supabase
          .from('usuarios')
          .insert({
            email: data.email,
            nome: data.nome, // Nome fornecido pelo admin
            foto: null
          })
          .select()
          .single()

        if (errorUsuario) {
          console.error('[useUsuarios] Erro ao criar usuário:', errorUsuario)
          throw errorUsuario
        }

        usuarioId = novoUsuario.id
        console.log('[useUsuarios] Novo usuário criado:', usuarioId)
      }

      // 4. Obter empresa_id
      const empresaId = await getEmpresaId()
      if (!empresaId) {
        throw new Error('Empresa não encontrada')
      }

      // 5. Verificar se já existe vínculo
      const { data: vinculoExistente } = await supabase
        .from('usuarios_empresas')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('empresa_id', empresaId)
        .single()

      if (vinculoExistente) {
        // Atualizar vínculo existente
        const { error: errorUpdate } = await supabase
          .from('usuarios_empresas')
          .update({
            papel: data.papel,
            permissoes: data.permissoes,
            ativo: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', vinculoExistente.id)

        if (errorUpdate) {
          console.error('[useUsuarios] Erro ao atualizar vínculo:', errorUpdate)
          throw errorUpdate
        }

        console.log('[useUsuarios] Vínculo atualizado')
      } else {
        // 6. Criar novo vínculo na tabela usuarios_empresas
        const { error: errorVinculo } = await supabase
          .from('usuarios_empresas')
          .insert({
            usuario_id: usuarioId,
            empresa_id: empresaId,
            papel: data.papel,
            permissoes: data.permissoes,
            ativo: true
          })

        if (errorVinculo) {
          console.error('[useUsuarios] Erro ao criar vínculo:', errorVinculo)
          throw errorVinculo
        }

        console.log('[useUsuarios] Vínculo criado com sucesso')
      }

      return {
        success: true,
        message: 'Convite enviado com sucesso!',
        usuarioId,
        link: inviteLink // Link para ser copiado
      }

    } catch (error: any) {
      console.error('[useUsuarios] Erro ao enviar convite:', error)
      return {
        success: false,
        message: error.message || 'Erro ao enviar convite',
        usuarioId: null
      }
    }
  }

  /**
   * Busca usuários vinculados à empresa atual
   */
  async function buscarUsuariosEmpresa() {
    try {
      const empresaId = await getEmpresaId()
      if (!empresaId) {
        console.error('[useUsuarios] Empresa ID não encontrado')
        throw new Error('Empresa não encontrada')
      }

      console.log('[useUsuarios] Buscando usuários da empresa:', empresaId)

      // Primeira tentativa: buscar apenas os vínculos
      const { data: vinculos, error: errorVinculos } = await supabase
        .from('usuarios_empresas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      console.log('[useUsuarios] Vínculos encontrados:', vinculos)
      console.log('[useUsuarios] Erro nos vínculos:', errorVinculos)

      if (errorVinculos) {
        console.error('[useUsuarios] Erro ao buscar vínculos:', errorVinculos)
        throw errorVinculos
      }

      if (!vinculos || vinculos.length === 0) {
        console.warn('[useUsuarios] Nenhum vínculo encontrado para empresa:', empresaId)
        return []
      }

      // Segunda tentativa: buscar dados dos usuários separadamente
      const usuarioIds = vinculos.map(v => v.usuario_id)
      console.log('[useUsuarios] IDs dos usuários:', usuarioIds)

      const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, nome, email, foto')
        .in('id', usuarioIds)

      console.log('[useUsuarios] Usuários encontrados:', usuarios)
      console.log('[useUsuarios] Erro nos usuários:', errorUsuarios)

      if (errorUsuarios) {
        console.error('[useUsuarios] Erro ao buscar usuários:', errorUsuarios)
      }

      // Combinar os dados
      const resultado = vinculos.map(vinculo => ({
        ...vinculo,
        usuarios: usuarios?.find(u => u.id === vinculo.usuario_id) || null
      }))

      console.log('[useUsuarios] Resultado final:', resultado)

      return resultado

    } catch (error) {
      console.error('[useUsuarios] Erro ao buscar usuários:', error)
      return []
    }
  }

  /**
   * Atualiza papel e permissões de um usuário
   */
  async function atualizarUsuario(vinculoId: string, papel: PapelUsuario, permissoes: Permissoes) {
    try {
      const { error } = await supabase
        .from('usuarios_empresas')
        .update({
          papel,
          permissoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', vinculoId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('[useUsuarios] Erro ao atualizar usuário:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * Ativa/desativa usuário
   */
  async function toggleStatusUsuario(vinculoId: string, ativo: boolean) {
    try {
      const { error } = await supabase
        .from('usuarios_empresas')
        .update({
          ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', vinculoId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('[useUsuarios] Erro ao alterar status:', error)
      return { success: false, message: error.message }
    }
  }

  /**
   * Remove vínculo usuário-empresa
   */
  async function removerUsuario(vinculoId: string) {
    try {
      const { error } = await supabase
        .from('usuarios_empresas')
        .delete()
        .eq('id', vinculoId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('[useUsuarios] Erro ao remover usuário:', error)
      return { success: false, message: error.message }
    }
  }

  return {
    enviarConvite,
    buscarUsuariosEmpresa,
    atualizarUsuario,
    toggleStatusUsuario,
    removerUsuario
  }
}
