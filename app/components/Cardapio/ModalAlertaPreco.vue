<script setup lang="ts">
interface Props {
  nomeProduto: string
  precoAntigo: number
  precoAtual: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirmar: []
  cancelar: []
}>()

const diferenca = computed(() => {
  return Math.abs(props.precoAtual - props.precoAntigo)
})

const tipoMudanca = computed(() => {
  return props.precoAtual > props.precoAntigo ? 'aumento' : 'reducao'
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div 
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
      @click.stop
    >
      <!-- Ícone de Alerta -->
      <div class="flex justify-center mb-4">
        <div 
          :class="[
            'w-16 h-16 rounded-full flex items-center justify-center',
            tipoMudanca === 'aumento' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'
          ]"
        >
          <svg 
            v-if="tipoMudanca === 'aumento'"
            class="w-8 h-8 text-orange-600 dark:text-orange-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg 
            v-else
            class="w-8 h-8 text-green-600 dark:text-green-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Título -->
      <h3 class="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        {{ tipoMudanca === 'aumento' ? '⚠️ Preço Atualizado' : '🎉 Preço Reduzido!' }}
      </h3>

      <!-- Descrição -->
      <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
        <strong>{{ nomeProduto }}</strong> teve o preço ajustado:
      </p>

      <!-- Comparação de Preços -->
      <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">No seu carrinho:</span>
          <span class="text-lg font-bold text-gray-900 dark:text-white">
            R$ {{ precoAntigo.toFixed(2) }}
          </span>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700"></div>
        
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Preço atual:</span>
          <span 
            :class="[
              'text-lg font-bold',
              tipoMudanca === 'aumento' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
            ]"
          >
            R$ {{ precoAtual.toFixed(2) }}
          </span>
        </div>

        <div 
          :class="[
            'flex items-center justify-center gap-2 pt-2 text-sm font-medium',
            tipoMudanca === 'aumento' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
          ]"
        >
          <svg 
            v-if="tipoMudanca === 'aumento'"
            class="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <svg 
            v-else
            class="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {{ tipoMudanca === 'aumento' ? 'Aumento' : 'Redução' }} de R$ {{ diferenca.toFixed(2) }}
        </div>
      </div>

      <!-- Aviso -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
        <p class="text-sm text-blue-800 dark:text-blue-300">
          ℹ️ O novo item será adicionado com o <strong>preço atual</strong>.
          Os itens já no carrinho mantêm o preço anterior.
        </p>
      </div>

      <!-- Botões -->
      <div class="flex gap-3">
        <button
          @click="emit('cancelar')"
          class="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="emit('confirmar')"
          class="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-orange-500/30"
        >
          Adicionar mesmo assim
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
