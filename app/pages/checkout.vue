<script setup lang="ts">
import type { DadosCheckout } from '~/../../shared/types/cardapio'

definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const router = useRouter()

const { carrinho, carrinhoVazio, limparCarrinho } = useCarrinho()

// Toast helpers
const mostrarSucesso = (msg: string) => {
  if (process.client) {
    alert(msg)
  }
}

const mostrarErro = (msg: string) => {
  if (process.client) {
    alert(msg)
  }
}

const mostrarAviso = (msg: string) => {
  if (process.client) {
    alert(msg)
  }
}

// Redirecionar se carrinho vazio (apenas no cliente)
onMounted(() => {
  if (carrinhoVazio.value) {
    navigateTo('/')
  }
})

// Dados do formulário
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

const finalizarPedido = async () => {
  if (!carrinho.value) return

  if (!dadosCheckout.value.nome_cliente.trim()) {
    mostrarAviso('Digite seu nome')
    return
  }

  if (!dadosCheckout.value.telefone_cliente.trim()) {
    mostrarAviso('Digite seu telefone')
    return
  }

  if (dadosCheckout.value.tipo_retirada === 'entrega') {
    if (!dadosCheckout.value.endereco?.logradouro.trim()) {
      mostrarAviso('Digite o endereço de entrega')
      return
    }
    if (!dadosCheckout.value.endereco?.numero.trim()) {
      mostrarAviso('Digite o número do endereço')
      return
    }
    if (!dadosCheckout.value.endereco?.bairro.trim()) {
      mostrarAviso('Digite o bairro')
      return
    }
  }

  if (dadosCheckout.value.forma_pagamento === 'dinheiro') {
    if (dadosCheckout.value.troco && dadosCheckout.value.troco < carrinho.value.total) {
      mostrarAviso('O troco deve ser maior que o valor total')
      return
    }
  }

  processando.value = true

  try {
    // Gerar ID temporário para o pedido
    const pedidoId = Date.now().toString().slice(-6)
    const empresaSlug = carrinho.value.empresa_slug
    
    // Por enquanto, apenas navegar para página de sucesso
    // TODO: Implementar criação do pedido no banco de dados
    mostrarSucesso('Pedido realizado com sucesso!')
    
    await navigateTo({
      path: '/sucesso',
      query: {
        pedido: pedidoId,
        empresa: empresaSlug
      }
    })
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error)
    mostrarErro('Erro ao finalizar pedido. Tente novamente.')
    processando.value = false
  }
}

useHead({
  title: 'Finalizar Pedido'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <button 
            @click="router.back()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Finalizar Pedido
          </h1>
        </div>
      </div>
    </div>

    <!-- Conteúdo -->
    <div v-if="carrinho" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Formulário -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Dados Pessoais -->
          <CardapioFormCheckout v-model="dadosCheckout" />

          <!-- Endereço -->
          <CardapioEnderecoForm 
            v-if="dadosCheckout.tipo_retirada === 'entrega'"
            v-model="dadosCheckout.endereco"
          />

          <!-- Forma de Pagamento -->
          <CardapioPagamentoSelector 
            v-model:forma-pagamento="dadosCheckout.forma_pagamento"
            v-model:troco="dadosCheckout.troco"
            :valor-total="carrinho.total"
          />

          <!-- Observações -->
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

        <!-- Resumo -->
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

    <!-- Carrinho vazio -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Seu carrinho está vazio
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Adicione produtos antes de finalizar o pedido
      </p>
      <button
        @click="router.back()"
        class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
      >
        Voltar ao cardápio
      </button>
    </div>
  </div>
</template>
