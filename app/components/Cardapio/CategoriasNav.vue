<script setup lang="ts">
import type { CategoriaProduto } from '../../../shared/types/cardapio'

interface Props {
  categorias: CategoriaProduto[]
  categoriaSelecionada: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selecionar: [categoriaId: string | null]
}>()

// Container de scroll horizontal
const scrollContainer = ref<HTMLElement | null>(null)

// Scroll para a categoria selecionada
const scrollParaCategoria = (categoriaId: string) => {
  if (!scrollContainer.value) return
  
  const elemento = scrollContainer.value.querySelector(`[data-categoria="${categoriaId}"]`)
  if (elemento) {
    elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

watch(() => props.categoriaSelecionada, (novaCategoria) => {
  if (novaCategoria) {
    scrollParaCategoria(novaCategoria)
  }
})
</script>

<template>
  <div class="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative">
        <!-- Scroll Container -->
        <div 
          ref="scrollContainer"
          class="flex gap-2 overflow-x-auto py-4 scrollbar-hide"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <!-- Botão "Todas" -->
          <button
            @click="emit('selecionar', null)"
            :class="[
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              categoriaSelecionada === null
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            <span>Todas</span>
          </button>

          <!-- Botões de Categorias -->
          <button
            v-for="categoria in categorias.filter(c => c.ativa)"
            :key="categoria.id"
            :data-categoria="categoria.id"
            @click="emit('selecionar', categoria.id)"
            :class="[
              'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              categoriaSelecionada === categoria.id
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            <span>{{ categoria.nome }}</span>
          </button>
        </div>

        <!-- Gradientes laterais para indicar scroll -->
        <div class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
        <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ocultar scrollbar em Webkit browsers */
::-webkit-scrollbar {
  display: none;
}
</style>
