<script setup lang="ts">
import type { DadosCheckout } from '~/../../shared/types/cardapio'

const props = defineProps<{
  formaPagamento: DadosCheckout['forma_pagamento']
  troco?: number
  valorTotal: number
}>()

const emit = defineEmits<{
  'update:formaPagamento': [value: DadosCheckout['forma_pagamento']]
  'update:troco': [value: number | undefined]
}>()

const forma = computed({
  get: () => props.formaPagamento,
  set: (value) => {
    emit('update:formaPagamento', value)
    // Limpar troco se não for dinheiro
    if (value !== 'dinheiro') {
      emit('update:troco', undefined)
    }
  }
})

const valorTroco = computed({
  get: () => props.troco,
  set: (value) => emit('update:troco', value)
})

const formasPagamento = [
  {
    id: 'dinheiro',
    nome: 'Dinheiro',
    icone: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'pix',
    nome: 'PIX',
    icone: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'cartao_debito',
    nome: 'Cartão Débito',
    icone: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    id: 'cartao_credito',
    nome: 'Cartão Crédito',
    icone: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  }
] as const

// Validar troco
const trocoInsuficiente = computed(() => {
  if (forma.value !== 'dinheiro' || !valorTroco.value) return false
  return valorTroco.value < props.valorTotal
})

// Calcular valor de volta
const valorVolta = computed(() => {
  if (forma.value !== 'dinheiro' || !valorTroco.value) return 0
  return Math.max(0, valorTroco.value - props.valorTotal)
})

// Formatação monetária
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">
      Forma de Pagamento
    </h2>

    <div class="space-y-4">
      <!-- Formas de Pagamento -->
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="formaPag in formasPagamento"
          :key="formaPag.id"
          type="button"
          @click="forma = formaPag.id"
          :class="[
            'p-4 rounded-lg border-2 transition-all',
            forma === formaPag.id
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          ]"
        >
          <div class="flex flex-col items-center gap-2">
            <svg 
              class="w-8 h-8" 
              :class="forma === formaPag.id ? 'text-orange-500' : 'text-gray-400'" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="formaPag.icone" />
            </svg>
            <span 
              :class="[
                'font-medium text-sm text-center',
                forma === formaPag.id 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-gray-700 dark:text-gray-300'
              ]"
            >
              {{ formaPag.nome }}
            </span>
          </div>
        </button>
      </div>

      <!-- Campo de Troco (só aparece se forma = dinheiro) -->
      <div v-if="forma === 'dinheiro'" class="mt-6 space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Troco para quanto?
          </label>
          <input
            v-model.number="valorTroco"
            type="number"
            step="0.01"
            min="0"
            placeholder="Digite o valor do troco"
            :class="[
              'w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              trocoInsuficiente
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            ]"
          />
          <p v-if="trocoInsuficiente" class="mt-2 text-sm text-red-600 dark:text-red-400">
            O valor do troco deve ser maior ou igual ao total do pedido
          </p>
        </div>

        <!-- Valor de Volta -->
        <div v-if="valorTroco && !trocoInsuficiente && valorVolta > 0" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-green-700 dark:text-green-300">
              Troco:
            </span>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">
              {{ formatarMoeda(valorVolta) }}
            </span>
          </div>
        </div>

        <!-- Sem Troco -->
        <label class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <input
            type="checkbox"
            :checked="!valorTroco"
            @change="valorTroco = undefined"
            class="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
          />
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Não preciso de troco
          </span>
        </label>
      </div>
    </div>
  </div>
</template>
