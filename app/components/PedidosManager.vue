<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Loading State -->
    <div v-if="pedidosLoading" class="flex items-center justify-center py-12">
      <div class="text-center space-y-4">
        <CircularProgress />
        <p class="text-muted-foreground">Carregando pedidos...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="pedidosError" class="flex items-center justify-center py-12">
      <div class="text-center space-y-4">
        <div class="text-red-500 text-xl">⚠️</div>
        <p class="text-red-600">{{ pedidosError }}</p>
        <button 
          @click="fetchPedidos" 
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
    <!-- Header com filtros e estatísticas rápidas -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-3 flex-1">
        <!-- Filtros de Status -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            @click="activeFilter = status.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeFilter === status.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            ]"
          >
            {{ status.label }}
            <span v-if="getOrderCountByStatus(status.value)" class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-background/50">
              {{ getOrderCountByStatus(status.value) }}
            </span>
          </button>
        </div>
        
        <!-- Campo de Busca -->
        <div class="relative flex-1 max-w-xs">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por pedido, cliente ou telefone..."
            class="w-full pl-10 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Botão Novo Pedido -->
      <button
        v-if="temPermissao('pedidos', 'criar')"
        @click="abrirModalNovoPedido"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-md"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Novo Pedido
      </button>
    </div>

    <!-- Grid de colunas por status (Kanban) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Coluna: Novos Pedidos -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            Novos Pedidos
            <span class="ml-auto text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('novo').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('novo')"
            :key="pedido.id"
            :pedido="pedido"
            :is-destacado="pedidosDestacados.has(pedido.id)"
            @view="viewOrder"
            @accept="acceptOrder"
            @print="printOrder"
            @cancel="abrirModalCancelar"
          />
        </div>
      </div>

      <!-- Coluna: Na Cozinha -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
            Na Cozinha
            <span class="ml-auto text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('cozinha').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('cozinha')"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @ready="markAsReady"
            @print="printOrder"
            @cancel="abrirModalCancelar"
          />
        </div>
      </div>

      <!-- Coluna: Saiu para Entrega -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
            Saiu para Entrega
            <span class="ml-auto text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('entrega').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in getOrdersByStatus('entrega')"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @complete="completeOrder"
            @print="printOrder"
            @cancel="abrirModalCancelar"
          />
        </div>
      </div>

      <!-- Coluna: Concluídos/Cancelados -->
      <div class="bg-card border border-border rounded-lg">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            Concluídos/Cancelados
            <span class="ml-auto text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {{ getOrdersByStatus('concluido').length + getOrdersByStatus('cancelado').length }}
            </span>
          </h3>
        </div>
        <div class="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          <PedidoCard
            v-for="pedido in [...getOrdersByStatus('concluido'), ...getOrdersByStatus('cancelado')]"
            :key="pedido.id"
            :pedido="pedido"
            @view="viewOrder"
            @print="printOrder"
            @cancel="abrirModalCancelar"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Visualização do Pedido -->
    <PedidoModal
      v-if="isModalOpen && selectedPedido"
      :pedido="selectedPedido"
      @close="closeModal"
      @accept="acceptOrder"
      @ready="markAsReady"
      @complete="completeOrder"
    />

    <!-- Modal de Novo Pedido -->
    <ModalNovoPedido
      :isOpen="isModalNovoPedidoOpen"
      @close="fecharModalNovoPedido"
      @pedido-criado="onPedidoCriado"
    />

    <!-- Modal de Cancelamento -->
    <ModalCancelarPedido
      :isOpen="isModalCancelarOpen"
      :pedidoId="pedidoParaCancelar?.id || ''"
      :pedidoNumero="pedidoParaCancelar?.numero || 0"
      @close="fecharModalCancelar"
      @confirm="confirmarCancelamento"
    />
    </div> <!-- Fecha div do content -->
  </div>
</template>

<script setup lang="ts">
import { useToastSafe } from '~/composables/useToastSafe'

// Usar o composable de pedidos
const {
  pedidos,
  isLoading: pedidosLoading,
  error: pedidosError,
  fetchPedidos,
  updatePedidoStatus,
  cancelarPedido,
  getPedidosByStatus,
  getOrderCountByStatus,
  setupRealtimeSubscription,
  stopNotification,
  pedidosDestacados,
  setModalAberto
} = usePedidos()

// Usar o composable de empresa para verificar permissões
const { temPermissao, buscarConfiguracoes } = useEmpresa()

// Buscar configurações da empresa
const configEmpresa = ref<any>(null)

onMounted(async () => {
  configEmpresa.value = await buscarConfiguracoes()
})

// Debug: Verificar se as funções foram carregadas
console.log('[PedidosManager] Funções do composable:', {
  fetchPedidos: !!fetchPedidos,
  updatePedidoStatus: !!updatePedidoStatus,
  getPedidosByStatus: !!getPedidosByStatus
})

// Tipos já definidos no composable
interface PedidoItem {
  nome: string
  quantidade: number
  preco: number
  observacao?: string
}

interface Pedido {
  id: string
  numero: number
  cliente: string
  telefone: string
  endereco?: string
  items: PedidoItem[]
  total: number
  formaPagamento: 'dinheiro' | 'cartao' | 'pix'
  tipoEntrega: 'retirada' | 'entrega'
  status: 'novo' | 'cozinha' | 'entrega' | 'concluido' | 'cancelado'
  observacao?: string
  troco?: number
  dataHora: Date
  tempoEstimado?: number
  valorEntrega?: number
  motivoCancelamento?: string
}

// Estados
const activeFilter = ref<string>('todos')
const isModalOpen = ref(false)
const selectedPedido = ref<Pedido | null>(null)
const isModalNovoPedidoOpen = ref(false)
const isModalCancelarOpen = ref(false)
const pedidoParaCancelar = ref<Pedido | null>(null)
const searchQuery = ref('')

// Filtros de status
const statusFilters = [
  { label: 'Todos', value: 'todos' },
  { label: 'Novos', value: 'novo' },
  { label: 'Cozinha', value: 'cozinha' },
  { label: 'Entrega', value: 'entrega' },
  { label: 'Concluídos', value: 'concluido' }
]

// Inicializar dados e real-time quando component montar
onMounted(async () => {
  console.log('[PedidosManager] Componente montado, inicializando...')
  await fetchPedidos()
  setupRealtimeSubscription()
  console.log('[PedidosManager] Inicialização concluída')
})

// Mostrar erro se houver
watchEffect(() => {
  if (pedidosError.value) {
    console.error('Erro nos pedidos:', pedidosError.value)
  }
})

// Computed para filtrar pedidos por status - agora usando o composable
const getOrdersByStatus = (status: string) => {
  let pedidos = getPedidosByStatus(status)
  
  // Aplicar filtro de busca se houver texto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    
    pedidos = pedidos.filter(pedido => {
      // Buscar por número do pedido
      const matchNumero = pedido.numero && pedido.numero.toString().includes(query)
      
      // Buscar por nome do cliente
      const clienteLower = pedido.cliente ? pedido.cliente.toLowerCase() : ''
      const matchCliente = clienteLower.includes(query)
      
      // Buscar por telefone (remove caracteres especiais)
      // Só busca no telefone se a query tiver números
      let matchTelefone = false
      if (pedido.telefone) {
        const queryClean = query.replace(/\D/g, '')
        if (queryClean.length > 0) { // Só busca se tiver números na query
          const telefoneClean = pedido.telefone.replace(/\D/g, '')
          matchTelefone = telefoneClean.includes(queryClean)
        }
      }
      
      return matchNumero || matchCliente || matchTelefone
    })
  }
  
  return pedidos
}

// Ações dos pedidos
const viewOrder = (pedido: Pedido) => {
  selectedPedido.value = pedido
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPedido.value = null
}

const acceptOrder = async (pedidoId: string) => {
  stopNotification() // Parar o som quando aceitar
  await updateOrderStatus(pedidoId, 'cozinha')
}

const markAsReady = async (pedidoId: string) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (pedido) {
    const nextStatus = pedido.tipoEntrega === 'entrega' ? 'entrega' : 'concluido'
    await updateOrderStatus(pedidoId, nextStatus)
  }
}

const completeOrder = async (pedidoId: string) => {
  await updateOrderStatus(pedidoId, 'concluido')
}

// Abrir modal de cancelamento
const abrirModalCancelar = (pedido: Pedido) => {
  pedidoParaCancelar.value = pedido
  isModalCancelarOpen.value = true
}

// Fechar modal de cancelamento
const fecharModalCancelar = () => {
  isModalCancelarOpen.value = false
  pedidoParaCancelar.value = null
}

// Confirmar cancelamento
const confirmarCancelamento = async (motivo: string) => {
  if (!pedidoParaCancelar.value) return

  const pedidoId = pedidoParaCancelar.value.id
  const pedidoNumero = pedidoParaCancelar.value.numero

  console.log(`[PedidosManager] Cancelando pedido #${pedidoNumero} com motivo: ${motivo}`)

  // Chamar função do composable
  const success = await cancelarPedido(pedidoId, motivo)

  if (success) {
    // Mostrar notificação de sucesso
    const toast = await useToastSafe()
    if (toast) {
      toast.success(`Pedido #${pedidoNumero} cancelado com sucesso!`)
    }

    // Fechar modal
    fecharModalCancelar()

    // Atualizar lista de pedidos
    await fetchPedidos()
  } else {
    // Mostrar erro
    const toast = await useToastSafe()
    if (toast) {
      toast.error(`Erro ao cancelar pedido #${pedidoNumero}. Tente novamente.`)
    }
  }
}

const updateOrderStatus = async (pedidoId: string, newStatus: string) => {
  const pedido = pedidos.value.find(p => p.id === pedidoId)
  if (!pedido) {
    console.error(`[PedidosManager] Pedido não encontrado: ${pedidoId}`)
    return
  }

  // Atualizar no Supabase
  const success = await updatePedidoStatus(pedidoId, newStatus)
  
  if (success) {
    // Mostrar notificação de sucesso
    const toast = await useToastSafe()
    if (toast) {
      let message = ''
      switch (newStatus) {
        case 'cozinha':
          message = `Pedido #${pedido.numero} aceito e enviado para cozinha!`
          break
        case 'entrega':
          message = `Pedido #${pedido.numero} está pronto e saiu para entrega!`
          break
        case 'concluido':
          message = `Pedido #${pedido.numero} foi concluído com sucesso!`
          break
        default:
          message = `Status do pedido #${pedido.numero} atualizado!`
      }
      toast.success(message)
    }
    
    // Fechar o modal com um pequeno delay para mostrar o feedback
    setTimeout(() => {
      closeModal()
    }, 800)
  } else {
    // Mostrar erro se não conseguiu atualizar
    const toast = await useToastSafe()
    if (toast) {
      toast.error(`Erro ao atualizar pedido #${pedido.numero}`)
    }
  }
}

const printOrder = (pedido: Pedido) => {
  // Debug: Verificar dados do pedido
  console.log('🖨️ [PedidosManager] Imprimindo pedido:', {
    numero: pedido.numero,
    cliente: pedido.cliente,
    items: pedido.items,
    itemsLength: pedido.items?.length,
    total: pedido.total
  })
  
  // Verificar se items existe e tem conteúdo
  if (!pedido.items || pedido.items.length === 0) {
    console.error('❌ AVISO: Pedido sem itens!', pedido)
    alert('Este pedido não possui itens para imprimir!')
    return
  }
  
  // Criar janela de impressão
  const printWindow = window.open('', '_blank', 'width=300,height=600')
  
  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir o pedido')
    return
  }

  // HTML formatado para impressora térmica 80mm
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pedido #${pedido.numero}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.2;
          margin: 0;
          padding: 8px;
          width: 72mm;
          color: #222;
          background: #fff;
          font-weight: normal;
        }
        
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
          color: #000;
        }
        
        .separator {
          border-bottom: 1px dashed #000;
          margin: 8px 0;
        }
        
        .section {
          margin-bottom: 8px;
        }
        
        .section-title {
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 14px;
          color: #000;
        }
        
        .item-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-weight: normal;
          font-size: 14px;
          color: #444;
        }
        
        .item-wrapper {
          margin-bottom: 4px;
        }
        
        .item-separator {
          color: #999;
          font-size: 10px;
          text-align: center;
          margin: 4px 0;
          overflow: hidden;
          white-space: nowrap;
        }
        
        .item-name {
          flex: 1;
          font-weight: normal;
          font-size: 14px;
          color: #444;
        }
        
        .item-price {
          text-align: right;
          min-width: 60px;
          font-weight: normal;
          font-size: 14px;
          color: #444;
        }
        
        .total-line {
          font-weight: bold;
          font-size: 16px;
          border-top: 1px solid #000;
          padding-top: 4px;
          margin-top: 8px;
          color: #000;
        }
        
        .footer {
          text-align: center;
          margin-top: 16px;
          border-top: 1px dashed #000;
          padding-top: 8px;
          color: #444;
        }
        
        .obs {
          background: #f5f5f5;
          padding: 4px;
          margin: 4px 0;
          border-left: 2px solid #666;
          font-weight: normal;
          font-size: 13px;
          color: #444;
        }
        
        @media screen {
          body {
            max-width: 300px;
            margin: 20px auto;
            border: 1px solid #ccc;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="font-size: 12px; margin-bottom: 4px;">CUPOM NAO FISCAL</div>
        <div class="restaurant-name">${configEmpresa.value?.nome || 'Empresa'}</div>
        <div style="font-size: 14px; color: #444;"><strong style="color: #000;">Plataforma:</strong> Agzap Delivery</div>
        ${configEmpresa.value?.cnpj ? `<div style="font-size: 14px; margin-top: 2px; color: #444;"><strong style="color: #000;">CNPJ:</strong> ${configEmpresa.value.cnpj}</div>` : ''}
      </div>
      
      <div class="section">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: #444;">
          <span><strong style="color: #000;">Pedido:</strong> #${pedido.numero}</span>
          <span><strong style="color: #000;">Data:</strong> ${formatDateTime(pedido.dataHora)}</span>
        </div>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <div class="section-title">CLIENTE:</div>
        <div style="margin-bottom: 2px; color: #444;">
          <strong style="color: #000;">Nome:</strong> ${pedido.cliente}
        </div>
        <div style="margin-bottom: 2px; color: #444;">
          <strong style="color: #000;">Telefone:</strong> ${pedido.telefone}
        </div>
        ${pedido.endereco ? `
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #ccc; color: #444;">
            <strong style="color: #000;">Endereço:</strong><br/>
            ${pedido.endereco}
          </div>
        ` : '<div style="margin-top: 4px; padding: 4px; background: #f0f0f0; text-align: center;"><strong>RETIRADA NO BALCÃO</strong></div>'}
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <div class="section-title">ITENS:</div>
        ${pedido.items && pedido.items.length > 0 
          ? pedido.items.map((item, index) => `
            <div class="item-wrapper">
              <div class="item-line">
                <span class="item-name">${item.quantidade}x ${item.nome}</span>
                <span class="item-price">R$ ${(item.quantidade * item.preco).toFixed(2)}</span>
              </div>
              ${item.observacao ? `<div class="obs">Obs: ${item.observacao}</div>` : ''}
              ${index < pedido.items.length - 1 ? '<div class="item-separator">...................................</div>' : ''}
            </div>
          `).join('')
          : '<div style="padding: 8px; text-align: center; color: #999;">Nenhum item encontrado</div>'
        }
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <div class="item-line">
          <span style="color: #555;"><strong style="color: #000;">Subtotal:</strong></span>
          <span style="color: #555;">R$ ${(pedido.total - (pedido.valorEntrega || 0)).toFixed(2)}</span>
        </div>
        ${pedido.tipoEntrega === 'entrega' && pedido.valorEntrega ? `
          <div class="item-line">
            <span style="color: #555;"><strong style="color: #000;">Taxa de entrega:</strong></span>
            <span style="color: #555;">R$ ${pedido.valorEntrega.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="item-line total-line">
          <span><strong>TOTAL:</strong></span>
          <span>R$ ${pedido.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="section">
        <div style="color: #444;"><strong style="color: #000;">Pagamento:</strong> ${getPaymentLabel(pedido.formaPagamento).toUpperCase()}</div>
        <div style="color: #444;"><strong style="color: #000;">Tipo:</strong> ${pedido.tipoEntrega === 'entrega' ? 'ENTREGA' : 'RETIRADA'}</div>
        ${pedido.troco ? `
          <div style="color: #444;"><strong style="color: #000;">Troco para:</strong> R$ ${pedido.troco.toFixed(2)}</div>
          <div style="color: #444;"><strong style="color: #000;">Troco:</strong> R$ ${(pedido.troco - pedido.total).toFixed(2)}</div>
        ` : ''}
        ${pedido.tempoEstimado ? `<div style="color: #444;"><strong style="color: #000;">Tempo estimado:</strong> ${pedido.tempoEstimado} min</div>` : ''}
      </div>
      
      ${pedido.observacao ? `
        <div class="separator"></div>
        <div class="section">
          <div class="section-title">OBSERVAÇÕES:</div>
          <div class="obs">${pedido.observacao}</div>
        </div>
      ` : ''}
      
      <div class="footer">
        <div>Obrigado pela preferência!</div>
        <div>${formatDateTime(new Date())}</div>
        <div style="font-size: 10px; color: #666; margin-top: 8px;">Desenvolvido por Agzap</div>
      </div>
    </body>
    </html>
  `
  
  // Escrever conteúdo na janela
  printWindow.document.write(printContent)
  printWindow.document.close()
  
  // Aguardar carregamento e imprimir
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      
      // Fechar janela após impressão (opcional)
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }, 250)
  }
  
  console.log(`Imprimindo pedido #${pedido.numero}`)
}

// Função auxiliar para formatar data/hora
const formatDateTime = (date: Date) => {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Função auxiliar para labels de pagamento
const getPaymentLabel = (payment: string) => {
  const labels = {
    dinheiro: 'Dinheiro',
    cartao: 'Cartão',
    pix: 'PIX'
  }
  return labels[payment as keyof typeof labels] || payment
}

// Função para abrir modal de novo pedido
const abrirModalNovoPedido = () => {
  isModalNovoPedidoOpen.value = true
  setModalAberto(true) // Pausa o polling
}

// Função para fechar modal de novo pedido
const fecharModalNovoPedido = () => {
  isModalNovoPedidoOpen.value = false
  setModalAberto(false) // Retoma o polling
}

// Função chamada após criar pedido com sucesso
const onPedidoCriado = () => {
  fecharModalNovoPedido()
  fetchPedidos() // Atualiza lista
}

</script>
