<script setup lang="ts">
import type { CategoriaProduto, ProdutoPublico, RestaurantePublico } from '~/../../shared/types/cardapio'

// PÁGINA PÚBLICA - Sem autenticação
definePageMeta({
  layout: false, // Sem layout do dashboard
  middleware: [], // Sem middleware de autenticação
  ssr: false // Desabilitar SSR para evitar problemas com Supabase
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

// Estados
const restaurante = ref<RestaurantePublico | null>(null)
const categorias = ref<CategoriaProduto[]>([])
const produtos = ref<ProdutoPublico[]>([])
const carregando = ref(true)
const erro = ref(false)

// Funções do composable (serão inicializadas no onMounted)
let buscarRestaurantePorSlug: any
let buscarCategorias: any
let buscarProdutos: any

// Categoria selecionada (null = todas)
const categoriaSelecionada = ref<string | null>(null)

// Inicializar carrinho
const { inicializarCarrinho, carrinho } = useCarrinho()

// Produto selecionado para modal
const produtoSelecionado = ref<ProdutoPublico | null>(null)

// Termo de pesquisa
const termoPesquisa = ref('')

// Produtos com promoção
const produtosPromocao = computed(() => {
  let prods = produtos.value.filter(p => p.promocao_ativa && p.preco_promocional)
  if (termoPesquisa.value) {
    prods = prods.filter(p => 
      p.nome.toLowerCase().includes(termoPesquisa.value.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(termoPesquisa.value.toLowerCase())
    )
  }
  return prods
})

// Categorias visíveis (filtradas por pesquisa, categoria selecionada e que tenham produtos)
const categoriasVisiveis = computed(() => {
  // Filtrar categorias que têm pelo menos 1 produto
  let cats = categorias.value.filter(c => {
    const produtosCategoria = produtosPorCategoria(c.id)
    return produtosCategoria.length > 0
  })
  
  if (categoriaSelecionada.value) {
    return cats.filter(c => c.id === categoriaSelecionada.value)
  }
  return cats
})

// Produtos por categoria
const produtosPorCategoria = (categoriaId: string) => {
  let prods = produtos.value.filter(p => p.categoria_id === categoriaId)
  if (termoPesquisa.value) {
    prods = prods.filter(p => 
      p.nome.toLowerCase().includes(termoPesquisa.value.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(termoPesquisa.value.toLowerCase())
    )
  }
  return prods
}

// Verificar se restaurante está aberto
const restauranteAberto = computed(() => {
  return restaurante.value?.aberto || false
})

// Texto do horário
const horarioTexto = computed(() => {
  if (!restaurante.value) return ''
  
  const abertura = restaurante.value.hora_abertura || '08:00:00'
  const fechamento = restaurante.value.hora_fechamento || '22:00:00'
  
  // Formatar horário (remover segundos)
  const aberturaFormatada = abertura.substring(0, 5)
  const fechamentoFormatada = fechamento.substring(0, 5)
  
  return `${aberturaFormatada} às ${fechamentoFormatada}`
})

// Abrir/fechar modal
const abrirDetalhes = (produto: ProdutoPublico) => {
  produtoSelecionado.value = produto
}

const fecharDetalhes = () => {
  produtoSelecionado.value = null
}

// Carregar dados do restaurante
const carregarDados = async () => {
  try {
    carregando.value = true
    erro.value = false

    // Buscar restaurante
    const rest = await buscarRestaurantePorSlug(slug)
    
    if (!rest) {
      erro.value = true
      return
    }

    restaurante.value = rest

    // Verificar se aceita pedidos online
    if (!rest.aceita_pedidos_online) {
      // Pode exibir mensagem informativa
      console.warn('Restaurante não aceita pedidos online no momento')
    }

    // Buscar categorias e produtos em paralelo
    const [cats, prods] = await Promise.all([
      buscarCategorias(rest.id),
      buscarProdutos(rest.id)
    ])

    categorias.value = cats
    produtos.value = prods

    // Inicializar carrinho
    if (!carrinho.value || carrinho.value.empresa_slug !== slug) {
      inicializarCarrinho(
        rest.id,
        rest.slug,
        rest.nome,
        rest.taxa_entrega
      )
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    erro.value = true
  } finally {
    carregando.value = false
  }
}

// Recarregar produtos e categorias (polling)
const recarregarDados = async () => {
  if (!restaurante.value) return
  
  try {
    const [cats, prods] = await Promise.all([
      buscarCategorias(restaurante.value.id),
      buscarProdutos(restaurante.value.id)
    ])

    categorias.value = cats
    produtos.value = prods
  } catch (error) {
    console.error('Erro ao recarregar dados:', error)
  }
}

// Realtime desabilitado temporariamente
// TODO: Implementar realtime de outra forma
const setupRealtime = () => {
  // Desabilitado por enquanto
  console.log('Realtime desabilitado temporariamente')
}

// Polling para dados menos críticos (60 segundos)
let pollingInterval: NodeJS.Timeout | null = null

const iniciarPolling = () => {
  // Primeira atualização após 60 segundos
  pollingInterval = setInterval(() => {
    recarregarDados()
  }, 60000) // 60 segundos
}

const pararPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

// Carregar dados ao montar
onMounted(async () => {
  // Inicializar composable apenas no cliente
  const cardapioPublico = useCardapioPublico()
  buscarRestaurantePorSlug = cardapioPublico.buscarRestaurantePorSlug
  buscarCategorias = cardapioPublico.buscarCategorias
  buscarProdutos = cardapioPublico.buscarProdutos
  
  await carregarDados()
  
  // Configurar sincronização híbrida
  setupRealtime() // Realtime para status crítico
  iniciarPolling() // Polling para produtos/categorias
})

// Limpar ao desmontar
onUnmounted(() => {
  pararPolling()
})

// Meta tags para SEO
useHead({
  title: computed(() => restaurante.value ? `${restaurante.value.nome} - Faça seu pedido online` : 'Cardápio Online'),
  meta: computed(() => [
    { name: 'description', content: `Peça agora no ${restaurante.value?.nome || ''}` },
    { property: 'og:title', content: restaurante.value?.nome || '' },
    { property: 'og:description', content: `Faça seu pedido online em ${restaurante.value?.nome || ''}` },
    { property: 'og:image', content: restaurante.value?.imagem_banner || '' },
  ])
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Loading -->
    <div v-if="carregando" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin w-12 h-12 mx-auto text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400">Carregando cardápio...</p>
      </div>
    </div>

    <!-- Erro -->
    <div v-else-if="erro || !restaurante" class="flex items-center justify-center min-h-screen p-4">
      <div class="text-center max-w-md">
        <svg class="w-20 h-20 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Restaurante não encontrado
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          O cardápio que você está procurando não está disponível ou foi desativado.
        </p>
      </div>
    </div>

    <!-- Conteúdo -->
    <template v-else>
      <!-- Banner Hero -->
      <div class="relative h-48 md:h-64 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
        <img 
          v-if="restaurante.imagem_banner"
          :src="restaurante.imagem_banner" 
          :alt="restaurante.nome"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      <!-- Header Info -->
      <div class="max-w-7xl mx-auto px-4 -mt-16 relative z-10 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div class="flex items-start gap-4">
            <!-- Logo -->
            <div v-if="restaurante.logo" class="flex-shrink-0">
              <img 
                :src="restaurante.logo" 
                :alt="restaurante.nome"
                class="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            </div>
            
            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {{ restaurante.nome }}
              </h1>
              
              <!-- Status -->
              <div class="flex items-center gap-4 text-sm mb-3">
                <span :class="['flex items-center gap-1.5 font-medium', restauranteAberto ? 'text-green-600' : 'text-red-600']">
                  <span class="w-2 h-2 rounded-full" :class="restauranteAberto ? 'bg-green-600 animate-pulse' : 'bg-red-600'"></span>
                  {{ restauranteAberto ? 'Loja Aberta' : 'Loja Fechada' }}
                </span>
                <span class="text-gray-600 dark:text-gray-400">
                  • Horário: {{ horarioTexto }}
                </span>
              </div>

              <!-- Endereço e Telefone -->
              <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p v-if="restaurante.endereco_completo" class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ restaurante.endereco_completo }}
                </p>
                <div class="flex items-center gap-4">
                  <p v-if="restaurante.telefone" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ restaurante.telefone }}
                  </p>
                  <p class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ restaurante.tempo_preparo_min || 45 }} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categorias em Pills -->
      <div class="max-w-7xl mx-auto px-4 mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            @click="categoriaSelecionada = null"
            :class="[
              'px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all',
              !categoriaSelecionada
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            Promoções
          </button>
          <button
            v-for="categoria in categoriasVisiveis"
            :key="categoria.id"
            @click="categoriaSelecionada = categoria.id"
            :class="[
              'px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all',
              categoriaSelecionada === categoria.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
          >
            {{ categoria.nome }}
          </button>
        </div>
      </div>

      <!-- Campo de Pesquisa -->
      <div class="max-w-7xl mx-auto px-4 mb-6">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="termoPesquisa"
            type="text"
            placeholder="Pesquisar"
            class="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <!-- Grid de Produtos -->
      <div class="max-w-7xl mx-auto px-4 pb-32">
        <!-- Seção de Promoções -->
        <div v-if="produtosPromocao.length > 0 && !categoriaSelecionada" class="mb-10">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg class="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
            PROMOÇÕES
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ produtosPromocao[0]?.descricao || `10% DESCONTO NA PRIMEIRA COMPRA - Para compras a partir de R$ ${restaurante.pedido_minimo?.toFixed(2) || '50.00'}` }}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardapioProdutoCard
              v-for="produto in produtosPromocao"
              :key="produto.id"
              :produto="produto"
              @click="abrirDetalhes(produto)"
            />
          </div>
        </div>

        <!-- Produtos por Categoria -->
        <div v-for="categoria in categoriasVisiveis" :key="categoria.id" class="mb-10">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 uppercase">
            {{ categoria.nome }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardapioProdutoCard
              v-for="produto in produtosPorCategoria(categoria.id)"
              :key="produto.id"
              :produto="produto"
              @click="abrirDetalhes(produto)"
            />
          </div>
        </div>
      </div>

      <!-- Modal de Detalhes do Produto -->
      <CardapioProdutoDetalhesModal
        v-if="produtoSelecionado"
        :produto="produtoSelecionado"
        @fechar="fecharDetalhes"
      />

      <!-- Badge do Carrinho Flutuante -->
      <CardapioCarrinhoBadge />
    </template>
  </div>
</template>
