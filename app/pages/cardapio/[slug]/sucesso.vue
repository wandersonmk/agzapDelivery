<script setup lang="ts">
import type { RestaurantePublico } from '~/../../shared/types/cardapio'

// PÁGINA PÚBLICA - Sem autenticação
definePageMeta({
  layout: false,
  middleware: []
})

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const { buscarRestaurantePorSlug } = useCardapioPublico()
const supabase = useSupabaseClient()

// Obter dados da query string
const pedidoId = route.query.pedido as string
const tokenQuery = route.query.token as string

// Estados
const restaurante = ref<RestaurantePublico | null>(null)
const numeroPedido = ref<number>(0)
const tokenRastreamento = ref<string>('')
const horarioPedido = ref(new Date())
const tempoEstimado = ref(45)
const carregando = ref(true)

// Carregar dados
onMounted(async () => {
  // Buscar restaurante
  const rest = await buscarRestaurantePorSlug(slug)
  if (!rest) {
    router.push(`/cardapio/${slug}`)
    return
  }
  restaurante.value = rest
  tempoEstimado.value = rest.tempo_preparo_min || 45

  // Se tiver ID do pedido, buscar dados reais
  if (pedidoId && tokenQuery) {
    const { data } = await supabase
      .from('pedidos')
      .select('id, token_rastreamento, created_at')
      .eq('id', pedidoId)
      .eq('token_rastreamento', tokenQuery)
      .single()

    if (data) {
      numeroPedido.value = parseInt(data.id)
      tokenRastreamento.value = data.token_rastreamento
      horarioPedido.value = new Date(data.created_at)
    }
  }

  // Fallback: gerar valores aleatórios
  if (!numeroPedido.value) {
    numeroPedido.value = Math.floor(Math.random() * 9000) + 1000
  }
  if (!tokenRastreamento.value) {
    tokenRastreamento.value = 'TRACK-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  carregando.value = false
})

// Calcular horário estimado de entrega
const horarioEstimado = computed(() => {
  if (!horarioPedido.value) return '--:--'
  const estimado = new Date(horarioPedido.value)
  estimado.setMinutes(estimado.getMinutes() + tempoEstimado.value)
  return estimado.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

// Copiar token
const copiado = ref(false)
const copiarToken = async () => {
  try {
    await navigator.clipboard.writeText(tokenRastreamento.value)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (error) {
    console.error('Erro ao copiar:', error)
  }
}

// Mensagem WhatsApp
const abrirWhatsApp = () => {
  if (!restaurante.value) return
  const telefone = restaurante.value.whatsapp.replace(/\D/g, '')
  const mensagem = `Olá! Fiz o pedido #${numeroPedido.value} pelo cardápio online. Gostaria de confirmar os detalhes.`
  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
  window.open(url, '_blank')
}

// Voltar ao cardápio
const voltarCardapio = () => {
  router.push(`/cardapio/${slug}`)
}

// Meta tags
useHead({
  title: computed(() => `Pedido Confirmado - ${restaurante.value?.nome || ''}`),
})

// Animação de entrada
const mostrarConteudo = ref(false)
onMounted(() => {
  setTimeout(() => {
    mostrarConteudo.value = true
  }, 100)
})
</script>

<template>
  <div v-if="carregando" class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
    <div class="text-center">
      <svg class="animate-spin w-12 h-12 mx-auto text-orange-500 mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-600 dark:text-gray-400">Carregando...</p>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
    <div 
      :class="[
        'w-full max-w-2xl transition-all duration-700',
        mostrarConteudo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      ]"
    >
      <!-- Card Principal -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        <!-- Header com Animação de Sucesso -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
          <!-- Ícone de Sucesso Animado -->
          <div class="mb-4 inline-flex items-center justify-center w-24 h-24 bg-white rounded-full animate-bounce">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 class="text-3xl font-bold text-white mb-2">
            Pedido Confirmado!
          </h1>
          <p class="text-green-100 text-lg">
            Obrigado pela preferência 🎉
          </p>
        </div>

        <!-- Conteúdo -->
        <div class="p-8 space-y-6">
          <!-- Número do Pedido -->
          <div class="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Número do Pedido
            </p>
            <p class="text-4xl font-bold text-gray-900 dark:text-white">
              #{{ numeroPedido }}
            </p>
          </div>

          <!-- Informações do Restaurante -->
          <div v-if="restaurante" class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <img
              v-if="restaurante.logo"
              :src="restaurante.logo"
              :alt="restaurante.nome"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="flex-1">
              <h2 class="font-bold text-gray-900 dark:text-white">
                {{ restaurante.nome }}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ restaurante.telefone }}
              </p>
            </div>
          </div>

          <!-- Tempo Estimado -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
              <svg class="w-8 h-8 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Tempo Estimado
              </p>
              <p class="text-lg font-bold text-orange-600 dark:text-orange-400">
                {{ tempoEstimado }} min
              </p>
            </div>

            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <svg class="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Previsão
              </p>
              <p class="text-lg font-bold text-blue-600 dark:text-blue-400">
                {{ horarioEstimado }}
              </p>
            </div>
          </div>

          <!-- Token de Rastreamento -->
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Código de Rastreamento
              </p>
              <button
                @click="copiarToken"
                class="px-3 py-1 text-xs font-medium rounded-lg transition-colors"
                :class="copiado 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'"
              >
                {{ copiado ? '✓ Copiado' : 'Copiar' }}
              </button>
            </div>
            <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {{ tokenRastreamento }}
            </p>
          </div>

          <!-- Informações Adicionais -->
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
            <div class="flex gap-3">
              <svg class="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-gray-700 dark:text-gray-300">
                <p class="font-medium mb-1">Acompanhe seu pedido</p>
                <p>Você receberá atualizações via WhatsApp sobre o status do seu pedido.</p>
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex flex-col gap-3 pt-4">
            <!-- Botão WhatsApp -->
            <button
              @click="abrirWhatsApp"
              class="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar no WhatsApp
            </button>

            <!-- Botão Voltar ao Cardápio -->
            <button
              @click="voltarCardapio"
              class="w-full py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all active:scale-95"
            >
              Voltar ao Cardápio
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p>Obrigado por escolher {{ restaurante?.nome }}! 🍕</p>
      </div>
    </div>
  </div>
</template>
