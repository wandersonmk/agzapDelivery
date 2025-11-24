<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const pedidoId = route.query.pedido as string
const empresaSlug = route.query.empresa as string

// Limpar carrinho ao acessar página de sucesso
const { limparCarrinho } = useCarrinho()
onMounted(() => {
  limparCarrinho()
})

useHead({
  title: 'Pedido Realizado com Sucesso!'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Card de Sucesso -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <!-- Ícone de Sucesso -->
        <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Título -->
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Pedido Realizado!
        </h1>
        
        <!-- Mensagem -->
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Seu pedido foi recebido com sucesso e está sendo preparado.
        </p>

        <!-- Número do Pedido -->
        <div v-if="pedidoId" class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Número do Pedido
          </p>
          <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            #{{ pedidoId }}
          </p>
        </div>

        <!-- Informações -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-left">
              <p class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Acompanhe seu pedido
              </p>
              <p class="text-xs text-blue-700 dark:text-blue-400">
                Você receberá atualizações via WhatsApp sobre o status do seu pedido.
              </p>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="space-y-3">
          <NuxtLink
            v-if="empresaSlug"
            :to="`/cardapio/${empresaSlug}`"
            class="block w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            Fazer Novo Pedido
          </NuxtLink>
          
          <NuxtLink
            :to="empresaSlug ? `/cardapio/${empresaSlug}` : '/'"
            class="block w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 font-medium rounded-lg transition-colors"
          >
            Voltar ao Cardápio
          </NuxtLink>
        </div>

        <!-- Mensagem de Agradecimento -->
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Obrigado por escolher nosso serviço! 🎉
        </p>
      </div>
    </div>
  </div>
</template>
