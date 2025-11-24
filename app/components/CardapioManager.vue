<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Link do Cardápio Online -->
    <div class="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-lg p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-foreground">Link do Cardápio Online</h3>
              <p class="text-sm text-muted-foreground">Compartilhe este link com seus clientes para receberem pedidos online</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground overflow-x-auto">
              {{ linkCardapio || 'Gerando link...' }}
            </div>
            <button
              @click="copiarLink"
              :disabled="!linkCardapio"
              :class="[
                'px-5 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                copiado 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              ]"
            >
              <svg v-if="!copiado" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ copiado ? 'Copiado!' : 'Copiar Link' }}
            </button>
            <a
              v-if="linkCardapio"
              :href="linkCardapio"
              target="_blank"
              class="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap active:scale-95"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visualizar
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs de Navegação -->
    <div class="flex gap-2 border-b border-border">
      <button
        @click="tabAtiva = 'produtos'"
        :class="[
          'px-4 py-2 border-b-2 font-medium transition-colors',
          tabAtiva === 'produtos'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        ]"
      >
        <font-awesome-icon icon="utensils" class="mr-2" />
        Produtos e Categorias
      </button>
      <button
        @click="tabAtiva = 'complementos'"
        :class="[
          'px-4 py-2 border-b-2 font-medium transition-colors',
          tabAtiva === 'complementos'
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        ]"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        Complementos e Adicionais
      </button>
    </div>

    <!-- Conteúdo das Tabs -->
    <div v-show="tabAtiva === 'produtos'">
      <!-- Cards de métricas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total de Produtos -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total de Produtos</p>
              <p class="text-2xl font-bold text-foreground">{{ produtos.length }}</p>
              <p class="text-xs text-green-600 mt-1">{{ produtos.filter((p: any) => p.ativo).length }} ativos</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <font-awesome-icon icon="utensils" class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <!-- Total de Categorias -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Categorias</p>
              <p class="text-2xl font-bold text-foreground">{{ categorias.length }}</p>
              <p class="text-xs text-green-600 mt-1">bem organizadas</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <font-awesome-icon icon="layer-group" class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <!-- Preço Médio -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Preço Médio</p>
              <p class="text-2xl font-bold text-foreground">R$ {{ precoMedio }}</p>
              <p class="text-xs text-yellow-600 mt-1">valor competitivo</p>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <font-awesome-icon icon="dollar-sign" class="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo Tab Produtos -->
    <div v-show="tabAtiva === 'produtos'" class="bg-card border border-border rounded-lg">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-foreground">Categorias e Produtos</h2>
            <p class="text-sm text-muted-foreground">Clique em uma categoria para ver seus produtos</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="mostrarModalCategoria = true"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <font-awesome-icon icon="plus" class="w-4 h-4 mr-2" />
              Nova Categoria
            </button>
          </div>
        </div>
        
        <!-- Componente de lista de categorias -->
        <CategoriasListView :categorias="categorias" :produtos="produtos" />
      </div>
    </div>

    <!-- Conteúdo Tab Complementos -->
    <div v-show="tabAtiva === 'complementos'">
      <ComplementosList />
    </div>

    <!-- Modal para Nova Categoria -->
    <ModalNovaCategoria 
      :is-visible="mostrarModalCategoria"
      @close="mostrarModalCategoria = false"
      @save="handleSalvarCategoria"
    />
  </div>
</template>

<script setup lang="ts">
import type { Categoria } from '@shared/types/cardapio.types'
import { gerarSlugUnico } from '~/utils/slugUtils'

// Composables
const { categorias, produtos, adicionarCategoria, carregarCardapio } = useCardapio()
const supabase = useSupabaseClient()
const { user } = useAuth()
const toast = useToastSafe()

// Estado da interface
const mostrarModalCategoria = ref(false)
const tabAtiva = ref('produtos') // 'produtos' ou 'complementos'

// Link do cardápio
const linkCardapio = ref('')
const copiado = ref(false)

// Carregar dados ao montar o componente
onMounted(async () => {
  await carregarCardapio()
  
  // Aguardar user estar disponível com timeout
  let tentativas = 0
  while (!user.value?.empresa_id && tentativas < 20) {
    await new Promise(resolve => setTimeout(resolve, 100))
    tentativas++
  }
  
  await carregarLinkCardapio()
})

// Watch para carregar link quando user estiver disponível
watch(() => user.value?.empresa_id, async (empresaId) => {
  if (empresaId && !linkCardapio.value) {
    await carregarLinkCardapio()
  }
})

// Buscar/gerar slug da empresa
const carregarLinkCardapio = async () => {
  try {
    // Buscar empresa_id do useEmpresa que já está carregado
    const { empresaAtual, getEmpresaId } = useEmpresa()
    
    // Primeiro tenta pegar da empresaAtual
    let empresaId = empresaAtual.value?.id
    
    // Se não tiver, busca via getEmpresaId
    if (!empresaId) {
      console.log('Aguardando empresa carregar...')
      empresaId = await getEmpresaId()
    }
    
    if (!empresaId) {
      console.log('Empresa não encontrada, tentando novamente em 500ms...')
      setTimeout(carregarLinkCardapio, 500)
      return
    }

    console.log('Carregando link do cardápio para empresa:', empresaId)

    const { data, error } = await supabase
      .from('empresas')
      .select('slug, nome')
      .eq('id', empresaId)
      .single()

    if (error) {
      console.error('Erro ao buscar empresa:', error)
      return
    }

    if (data) {
      // Se não tiver slug, gerar um
      if (!data.slug) {
        console.log('Gerando slug para:', data.nome)
        const novoSlug = await gerarSlugUnico(data.nome, empresaId)
        
        const { error: updateError } = await supabase
          .from('empresas')
          .update({ slug: novoSlug })
          .eq('id', empresaId)

        if (updateError) {
          console.error('Erro ao atualizar slug:', updateError)
        }

        linkCardapio.value = `${window.location.origin}/cardapio/${novoSlug}`
        console.log('Link gerado:', linkCardapio.value)
      } else {
        linkCardapio.value = `${window.location.origin}/cardapio/${data.slug}`
        console.log('Link carregado:', linkCardapio.value)
      }
    }
  } catch (err) {
    console.error('Erro ao carregar link do cardápio:', err)
  }
}

// Copiar link
const copiarLink = async () => {
  if (!linkCardapio.value) return
  
  try {
    await navigator.clipboard.writeText(linkCardapio.value)
    copiado.value = true
    toast?.success('Link copiado para a área de transferência!')
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (error) {
    console.error('Erro ao copiar:', error)
    toast?.error('Erro ao copiar link')
  }
}

// Computed
const precoMedio = computed(() => {
  if (produtos.value.length === 0) return '0,00'
  
  const soma = produtos.value.reduce((acc: number, produto: any) => {
    // Se for pizza com tamanhos, usar preço médio dos tamanhos
    if (produto.tipo === 'pizza' && produto.tamanhos && Array.isArray(produto.tamanhos)) {
      const precosTamanhos = produto.tamanhos.map((t: any) => Number(t.preco))
      const mediaTamanhos = precosTamanhos.reduce((sum: number, p: number) => sum + p, 0) / precosTamanhos.length
      return acc + mediaTamanhos
    }
    // Se for produto comum, usar preço direto
    return acc + Number(produto.preco)
  }, 0)
  
  const media = soma / produtos.value.length
  return media.toFixed(2).replace('.', ',')
})

// Handlers dos modals
const handleSalvarCategoria = (categoria: Omit<Categoria, 'id'>) => {
  adicionarCategoria(categoria)
  mostrarModalCategoria.value = false
}
</script>
