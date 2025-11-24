<script setup lang="ts">
import type { DadosCheckout, RestaurantePublico } from '~/../../shared/types/cardapio'

// PÁGINA PÚBLICA - Sem autenticação
definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const { carrinho, carrinhoVazio, limparCarrinho } = useCarrinho()
const { buscarRestaurantePorSlug, criarPedidoOnline } = useCardapioPublico()
const toast = useToastSafe()

// Redirecionar se carrinho vazio
if (carrinhoVazio.value) {
  router.push(`/cardapio/${slug}`)
}

// Buscar dados do restaurante
const restaurante = ref<RestaurantePublico | null>(null)
const carregando = ref(true)

onMounted(async () => {
  const rest = await buscarRestaurantePorSlug(slug)
  if (!rest) {
    toast?.error('Restaurante não encontrado')
    router.push(`/cardapio/${slug}`)
    return
  }
  restaurante.value = rest
  carregando.value = false
})

// Estado do formulário
const dadosCheckout = ref<DadosCheckout>({
  nome_cliente: '',
  telefone_cliente: '',
  tipo_retirada: 'entrega',
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    referencia: ''
  },
  forma_pagamento: 'dinheiro',
  troco: undefined,
  observacoes: ''
})

const processando = ref(false)

// Validar e finalizar pedido
const finalizarPedido = async () => {
  if (!carrinho.value) return

  // Validações
  if (!dadosCheckout.value.nome_cliente.trim()) {
    toast?.warning('Digite seu nome')
    return
  }

  if (!dadosCheckout.value.telefone_cliente.trim()) {
    toast?.warning('Digite seu telefone')
    return
  }

  if (dadosCheckout.value.tipo_retirada === 'entrega') {
    if (!dadosCheckout.value.endereco?.logradouro.trim()) {
      toast?.warning('Digite o endereço de entrega')
      return
    }
    if (!dadosCheckout.value.endereco?.numero.trim()) {
      toast?.warning('Digite o número do endereço')
      return
    }
    if (!dadosCheckout.value.endereco?.bairro.trim()) {
      toast?.warning('Digite o bairro')
      return
    }
  }

  if (dadosCheckout.value.forma_pagamento === 'dinheiro') {
    if (dadosCheckout.value.troco && dadosCheckout.value.troco < carrinho.value.total) {
      toast?.warning('O troco deve ser maior que o valor total')
      return
    }
  }

  processando.value = true

  try {
    if (!restaurante.value) {
      toast?.error('Erro ao processar pedido')
      return
    }

    // Criar pedido no banco de dados
    const pedidoCriado = await criarPedidoOnline({
      empresa_id: carrinho.value.empresa_id,
      nome_cliente: dadosCheckout.value.nome_cliente,
      telefone_cliente: dadosCheckout.value.telefone_cliente,
      tipo_retirada: dadosCheckout.value.tipo_retirada,
      endereco: dadosCheckout.value.tipo_retirada === 'entrega' ? dadosCheckout.value.endereco : undefined,
      forma_pagamento: dadosCheckout.value.forma_pagamento,
      troco: dadosCheckout.value.troco,
      observacoes: dadosCheckout.value.observacoes,
      itens: carrinho.value.itens,
      subtotal: carrinho.value.subtotal,
      taxa_entrega: carrinho.value.taxa_entrega,
      total: carrinho.value.total
    })

    // Limpar carrinho
    limparCarrinho()

    // Redirecionar para página de sucesso com dados do pedido
    toast?.success('Pedido realizado com sucesso!')
    router.push({
      path: `/cardapio/${slug}/sucesso`,
      query: {
        pedido: pedidoCriado.id,
        token: pedidoCriado.token_rastreamento
      }
    })
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error)
    toast?.error('Erro ao finalizar pedido. Tente novamente.')
  } finally {
    processando.value = false
  }
}

// Meta tags
useHead({
  title: computed(() => `Finalizar Pedido - ${restaurante.value?.nome || ''}`),
})
</script>

<template>
  <div v-if="carregando" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <svg class="animate-spin w-12 h-12 mx-auto text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-600 dark:text-gray-400">Carregando...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <NuxtLink 
            :to="`/cardapio/${slug}`"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              Finalizar Pedido
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ restaurante?.nome }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulário -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Dados Pessoais -->
          <CardapioFormCheckout v-model="dadosCheckout" />

          <!-- Endereço (se entrega) -->
          <CardapioEnderecoForm 
            v-if="dadosCheckout.tipo_retirada === 'entrega'"
            v-model="dadosCheckout.endereco"
          />

          <!-- Forma de Pagamento -->
          <CardapioPagamentoSelector 
            v-model:forma-pagamento="dadosCheckout.forma_pagamento"
            v-model:troco="dadosCheckout.troco"
            :valor-total="carrinho?.total || 0"
          />

          <!-- Observações Gerais -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Observações Gerais
            </h2>
            <textarea
              v-model="dadosCheckout.observacoes"
              rows="3"
              placeholder="Observações sobre o pedido (opcional)"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <!-- Resumo do Pedido -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <CardapioResumoPedido 
              :carrinho="carrinho"
              :processando="processando"
              @finalizar="finalizarPedido"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
