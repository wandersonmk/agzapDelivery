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
            email: data.email,
            nome: data.nome // Passar nome para criar usuário com metadata
          }
        })
        inviteLink = response.link
        console.log('[useUsuarios] Link de convite gerado:', inviteLink)
      } catch (inviteError: any) {
        console.warn('[useUsuarios] Aviso ao gerar link (continuando):', inviteError.message)
        // Continua mesmo se falhar
      }

      // 2. Obter empresa_id do admin logado
      const empresaId = await getEmpresaId()
      if (!empresaId) {
        throw new Error('Empresa não encontrada')
      }

      // 3. Salvar dados do convite pendente em uma tabela temporária
      // Isso permite criar o vínculo antes do usuário aceitar o convite
      const { error: errorConvitePendente } = await supabase
        .from('convites_pendentes')
        .upsert({
          email: data.email,
          nome: data.nome,
          empresa_id: empresaId,
          papel: data.papel,
          permissoes: data.permissoes,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        }, {
          onConflict: 'email,empresa_id'
        })

      if (errorConvitePendente) {
        console.error('[useUsuarios] Erro ao salvar convite pendente:', errorConvitePendente)
        // Continua mesmo se falhar - convite ainda será enviado
      } else {
        console.log('[useUsuarios] Convite pendente salvo com sucesso')
      }

      return {
        success: true,
        message: 'Convite enviado com sucesso!',
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

      // Buscar vínculos com JOIN para trazer dados do usuário E da empresa
      const { data: vinculos, error: errorVinculos } = await supabase
        .from('usuarios_empresas')
        .select(`
          *,
          usuarios (id, nome, email, foto),
          empresas (id, nome)
        `)
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

      console.log('[useUsuarios] Resultado final com empresa:', vinculos)

      // Buscar também convites pendentes
      const { data: convitesPendentes, error: errorConvites } = await supabase
        .from('convites_pendentes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

      console.log('[useUsuarios] Convites pendentes:', convitesPendentes)

      // Combinar usuários confirmados e pendentes
      const resultado = [
        ...vinculos,
        ...(convitesPendentes || []).map(convite => ({
          id: convite.id,
          usuario_id: null,
          empresa_id: convite.empresa_id,
          papel: convite.papel,
          permissoes: convite.permissoes,
          ativo: false,
          created_at: convite.created_at,
          updated_at: null,
          usuarios: {
            id: null,
            nome: convite.nome,
            email: convite.email,
            foto: null
          },
          empresas: vinculos[0]?.empresas || null,
          isPendente: true, // Flag para identificar convites pendentes
          expires_at: convite.expires_at
        }))
      ]

      console.log('[useUsuarios] Resultado final (com pendentes):', resultado)

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
