<script setup lang="ts">
import type { ProdutoPublico } from '../../../shared/types/cardapio'

interface Props {
  produto: ProdutoPublico
}

const props = defineProps<Props>()

// Calcular menor preço (para produtos por tamanho)
const menorPreco = computed(() => {
  if (props.produto.tipo === 'comum') {
    return props.produto.promocao_ativa && props.produto.preco_promocional
      ? props.produto.preco_promocional
      : props.produto.preco || 0
  } else {
    const precos = props.produto.tamanhos?.map(t => t.preco) || []
    return Math.min(...precos)
  }
})

// Preço original (se tiver promoção)
const precoOriginal = computed(() => {
  if (props.produto.tipo === 'comum' && props.produto.promocao_ativa && props.produto.preco_promocional) {
    return props.produto.preco
  }
  return null
})

// Percentual de desconto
const percentualDesconto = computed(() => {
  if (!precoOriginal.value || !props.produto.preco_promocional) return null
  return Math.round(((precoOriginal.value - props.produto.preco_promocional) / precoOriginal.value) * 100)
})
</script>

<template>
  <div 
    class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500"
  >
    <div class="flex gap-4 p-4">
      <!-- Imagem à esquerda -->
      <div class="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img 
          v-if="produto.imagem"
          :src="produto.imagem" 
          :alt="produto.nome"
          class="w-full h-full object-cover"
          loading="lazy"
        >
        
        <!-- Placeholder se não tiver imagem -->
        <div 
          v-else 
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
        >
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <!-- Badge de Promoção -->
        <div 
          v-if="produto.promocao_ativa && percentualDesconto"
          class="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow"
        >
          -{{ percentualDesconto }}%
        </div>
      </div>

      <!-- Conteúdo à direita -->
      <div class="flex-1 flex flex-col justify-between min-w-0">
        <!-- Nome do Produto -->
        <h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-2">
          {{ produto.nome }}
        </h3>

        <!-- Preço e Botão -->
        <div class="flex items-end justify-between gap-3">
          <div class="flex flex-col">
            <!-- Preço Original (riscado se tiver promoção) -->
            <div v-if="precoOriginal" class="text-sm text-red-500 dark:text-red-400 line-through">
              R$ {{ precoOriginal.toFixed(2) }}
            </div>
            
            <!-- Preço Atual -->
            <div class="flex items-baseline gap-1">
              <span 
                v-if="produto.tipo === 'pizza'"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                A partir de
              </span>
              <span 
                class="text-xl font-bold text-green-600 dark:text-green-500"
              >
                R$ {{ menorPreco.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Botão Add -->
          <button
            class="flex-shrink-0 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
