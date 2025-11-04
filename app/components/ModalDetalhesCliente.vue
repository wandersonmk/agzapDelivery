<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors hover:bg-black/60"
    @click.self="$emit('close')"
  >
    <div class="bg-card border border-border rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-3xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-3 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <font-awesome-icon icon="user" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-foreground leading-tight">{{ cliente?.nome }}</h2>
            <p class="text-xs text-muted-foreground leading-tight">Cliente desde {{ formatarDataCadastro(cliente?.created_at) }}</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-110 transition-all duration-200"
        >
          <font-awesome-icon icon="times" class="w-4 h-4" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="overflow-y-auto max-h-[calc(85vh-140px)]">
        <div class="p-3 space-y-3">
          <!-- Informações de Contato -->
          <div class="bg-muted/30 rounded-lg p-2.5">
            <h3 class="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <font-awesome-icon icon="address-card" class="text-primary text-xs" />
              Contato
            </h3>
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="text-xs text-muted-foreground uppercase tracking-wider">Telefone</label>
                <p class="text-sm font-medium text-foreground">{{ formatarTelefone(cliente?.telefone) }}</p>
              </div>
              <div v-if="cliente?.email">
                <label class="text-xs text-muted-foreground uppercase tracking-wider">E-mail</label>
                <p class="text-sm font-medium text-foreground truncate" :title="cliente?.email">{{ cliente?.email }}</p>
              </div>
            </div>
            
            <div v-if="cliente?.endereco" class="mt-2">
              <label class="text-xs text-muted-foreground uppercase tracking-wider">Endereço</label>
              <p class="text-sm font-medium text-foreground leading-tight">{{ cliente?.endereco }}</p>
            </div>
          </div>

          <!-- Estatísticas do Cliente -->
          <div class="grid grid-cols-3 gap-2">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
              <div class="flex flex-col items-center text-center">
                <div class="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center mb-1">
                  <font-awesome-icon icon="shopping-cart" class="text-white text-xs" />
                </div>
                <p class="text-xs text-muted-foreground leading-tight">Pedidos</p>
                <p class="text-lg font-bold text-foreground leading-tight">{{ cliente?.qtdPedidos || 0 }}</p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-2 border border-green-200 dark:border-green-800">
              <div class="flex flex-col items-center text-center">
                <div class="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center mb-1">
                  <font-awesome-icon icon="dollar-sign" class="text-white text-xs" />
                </div>
                <p class="text-xs text-muted-foreground leading-tight">Total</p>
                <p class="text-lg font-bold text-foreground leading-tight">R$ {{ formatarValor(cliente?.valor) }}</p>
              </div>
            </div>

            <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-2 border border-purple-200 dark:border-purple-800">
              <div class="flex flex-col items-center text-center">
                <div class="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center mb-1">
                  <font-awesome-icon icon="chart-line" class="text-white text-xs" />
                </div>
                <p class="text-xs text-muted-foreground leading-tight">Médio</p>
                <p class="text-lg font-bold text-foreground leading-tight">R$ {{ formatarValor(ticketMedio) }}</p>
              </div>
            </div>
          </div>

          <!-- Último Pedido -->
          <div v-if="cliente?.ultimoPedido" class="bg-muted/30 rounded-lg p-2.5">
            <h3 class="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <font-awesome-icon icon="clock" class="text-primary text-xs" />
              Último Pedido
            </h3>
            <p class="text-sm text-muted-foreground leading-tight">
              {{ formatarDataCompleta(cliente?.ultimoPedido) }}
            </p>
          </div>

          <!-- Observações -->
          <div v-if="cliente?.observacoes" class="bg-muted/30 rounded-lg p-2.5">
            <h3 class="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <font-awesome-icon icon="comment" class="text-primary text-xs" />
              Observações
            </h3>
            <p class="text-sm text-foreground leading-tight">{{ cliente?.observacoes }}</p>
          </div>
        </div>
      </div>

      <!-- Footer com Ações -->
      <div class="p-3 border-t border-border bg-muted/30">
        <div class="flex gap-2">
          <a
            :href="getWhatsAppLink()"
            target="_blank"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
          >
            <font-awesome-icon :icon="['fab', 'whatsapp']" class="w-4 h-4" />
            WhatsApp
          </a>
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-muted hover:bg-muted/60 hover:scale-105 text-foreground rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Cliente {
  id?: string
  nome: string
  telefone: string
  email?: string
  endereco?: string
  qtdPedidos: number
  valor: number
  ultimoPedido?: string
  observacoes?: string
  created_at?: string
}

interface Props {
  isOpen: boolean
  cliente: Cliente | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Computed
const ticketMedio = computed(() => {
  if (!props.cliente || !props.cliente.qtdPedidos) return 0
  return props.cliente.valor / props.cliente.qtdPedidos
})

// Methods
const formatarTelefone = (telefone: string) => {
  if (!telefone) return '-'
  const cleaned = telefone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return telefone
}

const formatarValor = (valor?: number) => {
  if (!valor) return '0,00'
  return valor.toFixed(2).replace('.', ',')
}

const formatarDataCadastro = (data?: string) => {
  if (!data) return 'Data não disponível'
  
  const dataObj = new Date(data)
  return dataObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatarDataCompleta = (data: string) => {
  const dataObj = new Date(data)
  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getWhatsAppLink = () => {
  if (!props.cliente?.telefone) return '#'
  
  const telefone = props.cliente.telefone.replace(/\D/g, '')
  const mensagem = `Olá ${props.cliente.nome}! Tudo bem? 😊`
  
  return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`
}
</script>
