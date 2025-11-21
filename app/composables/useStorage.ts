export const useStorage = () => {
  const supabase = useSupabaseClient()

  /**
   * Faz upload de uma imagem para o bucket 'img' no Supabase Storage
   * @param file - Arquivo de imagem
   * @param pasta - Subpasta dentro de 'img' (ex: 'produtos')
   * @returns URL pública da imagem
   */
  const uploadImagem = async (file: File, pasta: string = 'produtos'): Promise<string | null> => {
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const extensao = file.name.split('.').pop() || 'jpg'
      const nomeArquivo = `${timestamp}-${Math.random().toString(36).substring(7)}.${extensao}`
      const caminhoCompleto = `${pasta}/${nomeArquivo}`

      console.log('Fazendo upload para:', caminhoCompleto)
      console.log('Tipo de arquivo:', file.type)
      console.log('Tamanho do arquivo:', file.size, 'bytes')

      // Upload do arquivo para o bucket 'img'
      const { data, error } = await supabase.storage
        .from('img')
        .upload(caminhoCompleto, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (error) {
        console.error('Erro detalhado ao fazer upload:', {
          message: error.message,
          error: error
        })
        throw new Error(`Erro no upload: ${error.message}`)
      }

      console.log('Upload realizado com sucesso:', data)

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('img')
        .getPublicUrl(caminhoCompleto)

      console.log('URL pública gerada:', urlData.publicUrl)

      return urlData.publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error)
      return null
    }
  }

  /**
   * Remove uma imagem do Supabase Storage
   * @param urlCompleta - URL completa da imagem
   */
  const removerImagem = async (urlCompleta: string): Promise<boolean> => {
    try {
      // Validar se a URL existe e é válida
      if (!urlCompleta || typeof urlCompleta !== 'string' || !urlCompleta.startsWith('http')) {
        console.log('URL inválida ou vazia, nada para remover:', urlCompleta)
        return false
      }

      // Extrair o caminho do arquivo da URL
      const url = new URL(urlCompleta)
      const pathname = url.pathname
      
      // Remover /storage/v1/object/public/img/ da URL para obter o caminho
      const caminho = pathname.replace('/storage/v1/object/public/img/', '')

      if (!caminho) {
        console.error('Caminho inválido extraído da URL:', urlCompleta)
        return false
      }

      const { error } = await supabase.storage
        .from('img')
        .remove([caminho])

      if (error) {
        console.error('Erro ao remover imagem:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao processar remoção de imagem:', error)
      return false
    }
  }

  /**
   * Substitui uma imagem antiga por uma nova
   * @param urlAntiga - URL da imagem antiga a ser removida
   * @param novoFile - Novo arquivo de imagem
   * @param pasta - Subpasta dentro de 'img'
   * @returns URL pública da nova imagem
   */
  const substituirImagem = async (
    urlAntiga: string | null,
    novoFile: File,
    pasta: string = 'produtos'
  ): Promise<string | null> => {
    try {
      // Upload da nova imagem
      const novaUrl = await uploadImagem(novoFile, pasta)

      if (!novaUrl) {
        throw new Error('Falha ao fazer upload da nova imagem')
      }

      // Remover imagem antiga se existir
      if (urlAntiga) {
        await removerImagem(urlAntiga)
      }

      return novaUrl
    } catch (error) {
      console.error('Erro ao substituir imagem:', error)
      return null
    }
  }

  return {
    uploadImagem,
    removerImagem,
    substituirImagem
  }
}
