<script setup lang="ts">
const { carrinho, quantidadeTotal, carrinhoVazio } = useCarrinho()

const mostrarCarrinho = ref(false)
</script>

<template>
  <!-- Botão Flutuante -->
  <button
    v-if="carrinho && !carrinhoVazio"
    @click="mostrarCarrinho = true"
    class="fixed bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-40 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full md:rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-between md:justify-start gap-3 px-4 py-3 md:px-6 md:py-4 group animate-pulse-slow"
  >
    <!-- Ícone e Badge -->
    <div class="relative animate-bounce-subtle">
      <svg class="w-7 h-7 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      
      <!-- Badge de quantidade -->
      <span 
        v-if="quantidadeTotal > 0"
        class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-ping-slow shadow-lg border-2 border-white"
      >
        <span class="absolute inset-0 flex items-center justify-center">
          {{ quantidadeTotal }}
        </span>
      </span>
    </div>

    <!-- Texto e valor -->
    <div class="flex-1 flex items-center justify-between md:flex-col md:items-start md:flex-none">
      <span class="text-sm md:text-xs font-medium opacity-90">Ver carrinho</span>
      <span class="text-xl md:text-lg font-bold">
        R$ {{ carrinho?.total.toFixed(2) }}
      </span>
    </div>

    <!-- Seta (apenas desktop) -->
    <svg class="hidden md:block w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>

  <!-- Drawer do Carrinho -->
  <CardapioCarrinhoDrawer
    :aberto="mostrarCarrinho"
    @fechar="mostrarCarrinho = false"
  />
</template>

<style scoped>
/* Animação de pulso suave */
@keyframes pulse-slow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Animação de bounce sutil */
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce-subtle {
  animation: bounce-subtle 1s ease-in-out infinite;
}

/* Animação de ping suave no badge */
@keyframes ping-slow {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  75%, 100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.animate-ping-slow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background-color: rgb(239 68 68);
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
