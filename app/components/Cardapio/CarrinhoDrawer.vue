<script setup lang="ts">
interface Props {
  aberto: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  fechar: []
}>()

const { carrinho, carrinhoVazio, atualizarQuantidade, removerItem, podeFinalizarPedido } = useCarrinho()
const router = useRouter()

// Ir para checkout
const irParaCheckout = () => {
  if (!carrinho.value) return
  
  const pedidoMinimo = 20 // TODO: pegar do restaurante
  if (!podeFinalizarPedido(pedidoMinimo)) {
    return
  }
  
  router.push(`/cardapio/${carrinho.value.empresa_slug}/checkout`)
  emit('fechar')
}

// Fechar ao clicar fora
const fecharSeClicarFora = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('drawer-overlay')) {
    emit('fechar')
  }
}

// Fechar com ESC
const fecharComEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('fechar')
}

watch(() => props.aberto, (aberto) => {
  if (aberto) {
    document.addEventListener('keydown', fecharComEsc)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', fecharComEsc)
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', fecharComEsc)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="aberto"
        class="drawer-overlay fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        @click="fecharSeClicarFora"
      >
        <!-- Drawer -->
        <Transition name="slide">
          <div
            v-if="aberto"
            class="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Carrinho
              </h2>
              <button
                @click="emit('fechar')"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Conteúdo -->
            <div class="flex-1 overflow-y-auto p-4">
              <!-- Carrinho Vazio -->
              <div v-if="carrinhoVazio" class="flex flex-col items-center justify-center h-full text-center py-12">
                <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Seu carrinho está vazio
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Adicione produtos para fazer seu pedido
                </p>
                <button
                  @click="emit('fechar')"
                  class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
                >
                  Ver Cardápio
                </button>
              </div>

              <!-- Lista de Itens -->
              <div v-else class="space-y-3">
                <CardapioCarrinhoItem
                  v-for="item in carrinho?.itens"
                  :key="item.id"
                  :item="item"
                  @atualizar="atualizarQuantidade(item.id, $event)"
                  @remover="removerItem(item.id)"
                />
              </div>
            </div>

            <!-- Footer com Resumo -->
            <div v-if="!carrinhoVazio && carrinho" class="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <!-- Resumo de Valores -->
              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>R$ {{ carrinho.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Taxa de entrega</span>
                  <span>{{ carrinho.taxa_entrega > 0 ? `R$ ${carrinho.taxa_entrega.toFixed(2)}` : 'Grátis' }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span class="text-orange-500">R$ {{ carrinho.total.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Pedido Mínimo -->
              <div v-if="carrinho.subtotal < 20" class="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="text-xs text-amber-800 dark:text-amber-400">
                  <p class="font-medium">Pedido mínimo não atingido</p>
                  <p class="mt-1">Adicione mais R$ {{ (20 - carrinho.subtotal).toFixed(2) }} em produtos</p>
                </div>
              </div>

              <!-- Botão Finalizar -->
              <button
                @click="irParaCheckout"
                :disabled="!podeFinalizarPedido(20)"
                :class="[
                  'w-full py-4 rounded-xl font-bold transition-all',
                  podeFinalizarPedido(20)
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                ]"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
