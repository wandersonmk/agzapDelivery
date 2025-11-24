<script setup lang="ts">
import type { Carrinho } from '~/../../shared/types/cardapio'

const props = defineProps<{
  carrinho: Carrinho | null
  processando: boolean
}>()

const emit = defineEmits<{
  finalizar: []
}>()

// Formatação monetária
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

// Resumo de complementos
const resumirComplementos = (complementos: string[]) => {
  if (complementos.length === 0) return ''
  if (complementos.length <= 2) return complementos.join(', ')
  return `${complementos[0]}, ${complementos[1]} +${complementos.length - 2}`
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">
      Resumo do Pedido
    </h2>

    <!-- Lista de Itens -->
    <div v-if="carrinho && carrinho.itens.length > 0" class="space-y-4 mb-6">
      <div
        v-for="item in carrinho.itens"
        :key="item.id"
        class="flex gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
      >
        <!-- Imagem -->
        <img
          :src="item.imagem"
          :alt="item.nome"
          class="w-16 h-16 rounded-lg object-cover"
        />

        <!-- Detalhes -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-white text-sm">
                {{ item.nome }}
              </h3>
              <p v-if="item.tamanho" class="text-xs text-gray-600 dark:text-gray-400">
                Tamanho: {{ item.tamanho }}
              </p>
              <p v-if="item.complementos.length > 0" class="text-xs text-gray-600 dark:text-gray-400">
                {{ resumirComplementos(item.complementos) }}
              </p>
            </div>
            <span class="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
              {{ item.quantidade }}x {{ formatarMoeda(item.preco) }}
            </span>
          </div>
          <p class="text-sm font-medium text-orange-600 dark:text-orange-400 mt-1">
            {{ formatarMoeda(item.subtotal) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else class="text-center py-8">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">
        Seu carrinho está vazio
      </p>
    </div>

    <!-- Totais -->
    <div v-if="carrinho" class="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
        <span class="font-medium text-gray-900 dark:text-white">
          {{ formatarMoeda(carrinho.subtotal) }}
        </span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Taxa de entrega</span>
        <span class="font-medium text-gray-900 dark:text-white">
          {{ carrinho.taxa_entrega > 0 ? formatarMoeda(carrinho.taxa_entrega) : 'Grátis' }}
        </span>
      </div>
      <div class="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
        <span class="text-gray-900 dark:text-white">Total</span>
        <span class="text-orange-600 dark:text-orange-400">
          {{ formatarMoeda(carrinho.total) }}
        </span>
      </div>
    </div>

    <!-- Botão Finalizar -->
    <button
      @click="emit('finalizar')"
      :disabled="processando || !carrinho || carrinho.itens.length === 0"
      :class="[
        'w-full mt-6 py-4 rounded-lg font-bold text-white transition-all',
        processando || !carrinho || carrinho.itens.length === 0
          ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95'
      ]"
    >
      <span v-if="processando" class="flex items-center justify-center gap-2">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processando...
      </span>
      <span v-else>
        Finalizar Pedido
      </span>
    </button>

    <!-- Informações Adicionais -->
    <p class="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
      Ao finalizar, você receberá a confirmação via WhatsApp
    </p>
  </div>
</template>
