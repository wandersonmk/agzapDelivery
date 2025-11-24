<script setup lang="ts">
import type { ProdutoPublico } from '../../../shared/types/cardapio'

interface Props {
  produtos: ProdutoPublico[]
}

const props = defineProps<Props>()

// Produto selecionado para modal
const produtoSelecionado = ref<ProdutoPublico | null>(null)

const abrirDetalhes = (produto: ProdutoPublico) => {
  produtoSelecionado.value = produto
}

const fecharDetalhes = () => {
  produtoSelecionado.value = null
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Mensagem quando não há produtos -->
    <div v-if="produtos.length === 0" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhum produto encontrado
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Não há produtos disponíveis nesta categoria no momento.
      </p>
    </div>

    <!-- Lista de Produtos -->
    <div 
      v-else
      class="space-y-4"
    >
      <CardapioProdutoCard
        v-for="produto in produtos"
        :key="produto.id"
        :produto="produto"
        @click="abrirDetalhes(produto)"
      />
    </div>

    <!-- Modal de Detalhes do Produto -->
    <CardapioProdutoDetalhesModal
      v-if="produtoSelecionado"
      :produto="produtoSelecionado"
      @fechar="fecharDetalhes"
    />
  </div>
</template>
