<script setup lang="ts">
import type { ItemCarrinho } from '../../../shared/types/cardapio'

interface Props {
  item: ItemCarrinho
}

const props = defineProps<Props>()
const emit = defineEmits<{
  atualizar: [novaQuantidade: number]
  remover: []
}>()

// Formatação de complementos para exibição
const complementosTexto = computed(() => {
  if (!props.item.complementos || props.item.complementos.length === 0) return null
  
  return props.item.complementos.map(grupo => {
    const itens = grupo.itens.map(i => i.nome).join(', ')
    return `${grupo.grupo_nome}: ${itens}`
  }).join(' • ')
})
</script>

<template>
  <div class="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
    <!-- Imagem -->
    <div class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
      <img 
        v-if="item.imagem"
        :src="item.imagem" 
        :alt="item.nome"
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <!-- Nome e Tamanho -->
      <div class="flex items-start justify-between gap-2 mb-1">
        <h4 class="font-medium text-gray-900 dark:text-white text-sm">
          {{ item.nome }}
          <span v-if="item.tamanho" class="text-orange-500 font-bold">
            ({{ item.tamanho }})
          </span>
        </h4>
        <button
          @click="emit('remover')"
          class="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Complementos -->
      <p v-if="complementosTexto" class="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
        {{ complementosTexto }}
      </p>

      <!-- Observações -->
      <p v-if="item.observacoes" class="text-xs text-gray-500 dark:text-gray-500 italic mb-2">
        Obs: {{ item.observacoes }}
      </p>

      <!-- Quantidade e Preço -->
      <div class="flex items-center justify-between">
        <!-- Controles de Quantidade -->
        <div class="flex items-center gap-2">
          <button
            @click="emit('atualizar', Math.max(1, item.quantidade - 1))"
            class="w-7 h-7 rounded-full bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 flex items-center justify-center transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <span class="text-sm font-bold w-6 text-center">{{ item.quantidade }}</span>
          <button
            @click="emit('atualizar', item.quantidade + 1)"
            class="w-7 h-7 rounded-full bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 flex items-center justify-center transition-colors shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Preço -->
        <div class="text-right">
          <div class="text-sm font-bold text-orange-500">
            R$ {{ item.subtotal.toFixed(2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
