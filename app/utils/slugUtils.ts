/**
 * Gerar slug a partir do nome do restaurante
 * Remove acentos, espaços e caracteres especiais
 * Converte para lowercase
 */
export const gerarSlug = (texto: string): string => {
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiais
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .replace(/--+/g, '-') // Substituir múltiplos hífens por um único
    .replace(/^-+|-+$/g, '') // Remover hífens do início e fim
}

/**
 * Validar se slug é válido
 */
export const validarSlug = (slug: string): boolean => {
  // Slug deve ter apenas letras minúsculas, números e hífens
  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return regex.test(slug)
}

/**
 * Gerar slug único adicionando número se necessário
 */
export const gerarSlugUnico = async (
  nome: string,
  empresaId?: string
): Promise<string> => {
  const supabase = useSupabaseClient()
  let slug = gerarSlug(nome)
  let contador = 1

  while (true) {
    const slugTeste = contador === 1 ? slug : `${slug}-${contador}`

    // Verificar se slug já existe
    let query = supabase
      .from('empresas')
      .select('id')
      .eq('slug', slugTeste)

    // Se estiver atualizando, excluir a própria empresa da busca
    if (empresaId) {
      query = query.neq('id', empresaId)
    }

    const { data } = await query.single()

    // Se não encontrou, slug está disponível
    if (!data) {
      return slugTeste
    }

    contador++
  }
}

/**
 * Atualizar slug da empresa
 */
export const atualizarSlugEmpresa = async (
  empresaId: string,
  novoSlug: string
): Promise<boolean> => {
  const supabase = useSupabaseClient()

  try {
    const { error } = await supabase
      .from('empresas')
      .update({ slug: novoSlug })
      .eq('id', empresaId)

    if (error) {
      console.error('Erro ao atualizar slug:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar slug:', error)
    return false
  }
}
