<script setup lang="ts">
import type { RestaurantePublico } from '../../../shared/types/cardapio'

interface Props {
  restaurante: RestaurantePublico
}

const props = defineProps<Props>()

// Verificar se está aberto agora
const estaAberto = computed(() => {
  if (!props.restaurante.horario_funcionamento) return true
  
  const agora = new Date()
  const diaAtual = agora.getDay()
  const horaAtual = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0')
  
  const horarioHoje = props.restaurante.horario_funcionamento.find(h => h.dia === diaAtual)
  
  if (!horarioHoje || !horarioHoje.aberto) return false
  
  return horaAtual >= horarioHoje.abertura && horaAtual <= horarioHoje.fechamento
})

// Próximo horário de abertura
const proximaAbertura = computed(() => {
  if (estaAberto.value || !props.restaurante.horario_funcionamento) return null
  
  const agora = new Date()
  const diaAtual = agora.getDay()
  
  // Buscar próximo dia aberto
  for (let i = 1; i <= 7; i++) {
    const proximoDia = (diaAtual + i) % 7
    const horario = props.restaurante.horario_funcionamento.find(h => h.dia === proximoDia && h.aberto)
    
    if (horario) {
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      return {
        dia: diasSemana[proximoDia],
        hora: horario.abertura
      }
    }
  }
  
  return null
})
</script>

<template>
  <div class="relative">
    <!-- Banner -->
    <div 
      class="h-48 md:h-64 bg-cover bg-center relative"
      :style="{ backgroundImage: restaurante.imagem_banner ? `url(${restaurante.imagem_banner})` : 'none', backgroundColor: restaurante.cor_tema }"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
    </div>

    <!-- Info do Restaurante -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative -mt-16 sm:-mt-20">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Logo -->
            <div 
              v-if="restaurante.logo"
              class="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-lg"
            >
              <img 
                :src="restaurante.logo" 
                :alt="restaurante.nome"
                class="w-full h-full object-cover"
              >
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {{ restaurante.nome }}
                  </h1>
                  <p v-if="restaurante.descricao" class="mt-1 text-gray-600 dark:text-gray-400">
                    {{ restaurante.descricao }}
                  </p>
                </div>

                <!-- Status -->
                <div class="flex-shrink-0">
                  <span 
                    v-if="estaAberto"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Aberto
                  </span>
                  <span 
                    v-else
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  >
                    <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                    Fechado
                  </span>
                </div>
              </div>

              <!-- Detalhes -->
              <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <!-- Tempo de preparo -->
                <div class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ restaurante.tempo_preparo_min }} min</span>
                </div>

                <!-- Taxa de entrega -->
                <div class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {{ restaurante.taxa_entrega > 0 ? `R$ ${restaurante.taxa_entrega.toFixed(2)}` : 'Grátis' }}
                  </span>
                </div>

                <!-- Pedido mínimo -->
                <div v-if="restaurante.pedido_minimo > 0" class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Pedido mínimo: R$ {{ restaurante.pedido_minimo.toFixed(2) }}</span>
                </div>

                <!-- Telefone/WhatsApp -->
                <a 
                  v-if="restaurante.whatsapp"
                  :href="`https://wa.me/${restaurante.whatsapp}`"
                  target="_blank"
                  class="flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:underline"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>

              <!-- Aviso de fechado -->
              <div v-if="!estaAberto && proximaAbertura" class="mt-3">
                <div class="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-lg text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Abriremos {{ proximaAbertura.dia }} às {{ proximaAbertura.hora }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
