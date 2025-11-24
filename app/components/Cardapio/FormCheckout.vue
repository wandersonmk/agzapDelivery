<script setup lang="ts">
import type { DadosCheckout } from '~/../../shared/types/cardapio'

const props = defineProps<{
  modelValue: DadosCheckout
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DadosCheckout]
}>()

const dados = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Formatar telefone
const formatarTelefone = (valor: string) => {
  const numeros = valor.replace(/\D/g, '')
  if (numeros.length <= 11) {
    return numeros
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }
  return numeros.slice(0, 11)
}

const atualizarTelefone = (event: Event) => {
  const input = event.target as HTMLInputElement
  const formatado = formatarTelefone(input.value)
  dados.value.telefone_cliente = formatado
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">
      Dados Pessoais
    </h2>

    <div class="space-y-4">
      <!-- Nome -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome Completo *
        </label>
        <input
          v-model="dados.nome_cliente"
          type="text"
          placeholder="Digite seu nome completo"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Telefone -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Telefone/WhatsApp *
        </label>
        <input
          :value="dados.telefone_cliente"
          @input="atualizarTelefone"
          type="tel"
          placeholder="(00) 00000-0000"
          maxlength="15"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Tipo de Retirada -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipo de Pedido *
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="dados.tipo_retirada = 'entrega'"
            :class="[
              'p-4 rounded-lg border-2 transition-all',
              dados.tipo_retirada === 'entrega'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            ]"
          >
            <div class="flex flex-col items-center gap-2">
              <svg class="w-8 h-8" :class="dados.tipo_retirada === 'entrega' ? 'text-orange-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span :class="['font-medium', dados.tipo_retirada === 'entrega' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300']">
                Entrega
              </span>
            </div>
          </button>

          <button
            type="button"
            @click="dados.tipo_retirada = 'retirada'"
            :class="[
              'p-4 rounded-lg border-2 transition-all',
              dados.tipo_retirada === 'retirada'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            ]"
          >
            <div class="flex flex-col items-center gap-2">
              <svg class="w-8 h-8" :class="dados.tipo_retirada === 'retirada' ? 'text-orange-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span :class="['font-medium', dados.tipo_retirada === 'retirada' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300']">
                Retirada
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
