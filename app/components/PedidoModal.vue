<template>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-card border border-border rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
      <!-- Header Ultra Compacto -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div>
          <h2 class="text-base font-bold text-foreground">Pedido #{{ pedido?.numero }}</h2>
          <p class="text-[10px] text-muted-foreground">{{ pedido?.dataHora.toLocaleString('pt-BR') }}</p>
        </div>
        <div class="flex items-center gap-1.5">
          <span :class="[
            'px-1.5 py-0.5 text-[10px] font-medium rounded-full',
            getStatusColor(pedido?.status || '')
          ]">
            {{ getStatusLabel(pedido?.status || '') }}
          </span>
          <button
            @click="$emit('close')"
            class="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <font-awesome-icon icon="times" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Conteúdo Ultra Compacto -->
      <div class="overflow-y-auto max-h-[calc(80vh-110px)]">
        <div class="p-3 space-y-2">
          <!-- Informações do Cliente -->
          <div class="bg-muted/30 rounded p-2">
            <h3 class="font-semibold text-xs text-foreground mb-1.5">Informações do Cliente</h3>
            <div class="grid grid-cols-2 gap-1.5 text-xs">
              <div>
                <label class="text-[10px] font-medium text-muted-foreground">Nome</label>
                <p class="text-foreground leading-tight">{{ pedido?.cliente }}</p>
              </div>
              <div>
                <label class="text-[10px] font-medium text-muted-foreground">Telefone</label>
                <p class="text-foreground leading-tight">{{ pedido?.telefone }}</p>
              </div>
              <div v-if="pedido?.endereco" class="col-span-2">
                <label class="text-[10px] font-medium text-muted-foreground">Endereço</label>
                <p class="text-foreground text-xs leading-tight">{{ pedido?.endereco }}</p>
              </div>
            </div>
          </div>

          <!-- Itens do Pedido -->
          <div>
            <h3 class="font-semibold text-xs text-foreground mb-1.5">Itens do Pedido</h3>
            <div v-if="!pedido?.items || pedido.items.length === 0" class="text-xs text-muted-foreground italic p-1.5 bg-muted/30 rounded">
              Nenhum item encontrado
            </div>
            <div v-else class="space-y-1.5">
              <div
                v-for="(item, index) in pedido?.items"
                :key="index"
                class="flex items-start justify-between p-1.5 bg-muted/30 rounded text-xs"
              >
                <div class="flex-1">
                  <p class="font-medium text-foreground leading-tight">{{ item.quantidade }}x {{ item.nome }}</p>
                  <p v-if="item.observacao" class="text-[10px] text-muted-foreground mt-0.5">
                    Obs: {{ item.observacao }}
                  </p>
                </div>
                <div class="text-right ml-2">
                  <p class="text-muted-foreground text-[10px]">R$ {{ item.preco.toFixed(2) }} un</p>
                  <p class="font-semibold text-foreground text-xs">R$ {{ (item.quantidade * item.preco).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumo Financeiro -->
          <div class="bg-muted/30 rounded p-2">
            <h3 class="font-semibold text-xs text-foreground mb-1.5">Resumo Financeiro</h3>
            <div class="space-y-0.5 text-xs">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Subtotal</span>
                <span class="text-foreground">R$ {{ (pedido?.total - (pedido?.valorEntrega || 0)).toFixed(2) }}</span>
              </div>
              <div v-if="pedido?.valorEntrega && pedido?.tipoEntrega === 'entrega'" class="flex justify-between">
                <span class="text-muted-foreground">Taxa de entrega</span>
                <span class="text-foreground">R$ {{ pedido.valorEntrega.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-sm pt-1 border-t border-border">
                <span class="text-foreground">Total</span>
                <span class="text-foreground">R$ {{ pedido?.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Detalhes de Pagamento e Entrega -->
          <div class="grid grid-cols-2 gap-1.5 text-xs">
            <div class="bg-muted/30 rounded p-1.5">
              <label class="text-[10px] font-medium text-muted-foreground block mb-0.5">Pagamento</label>
              <span :class="[
                'inline-block px-1.5 py-0.5 text-[10px] font-medium rounded',
                getPaymentColor(pedido?.formaPagamento || '')
              ]">
                {{ getPaymentLabel(pedido?.formaPagamento || '') }}
              </span>
            </div>
            <div class="bg-muted/30 rounded p-1.5">
              <label class="text-[10px] font-medium text-muted-foreground block mb-0.5">Tipo</label>
              <span :class="[
                'inline-block px-1.5 py-0.5 text-[10px] font-medium rounded',
                pedido?.tipoEntrega === 'entrega' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              ]">
                {{ pedido?.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada' }}
              </span>
            </div>
          </div>

          <!-- Troco -->
          <div v-if="pedido?.troco" class="bg-muted/30 rounded p-1.5 text-xs">
            <div class="flex justify-between mb-0.5">
              <span class="text-muted-foreground text-[10px]">Troco para:</span>
              <span class="text-foreground">R$ {{ Number(pedido.troco).toFixed(2) }}</span>
            </div>
            <div v-if="Number(pedido.troco) > Number(pedido.total)" class="flex justify-between font-medium">
              <span class="text-foreground text-[10px]">Levar de troco:</span>
              <span class="text-green-600 text-xs">R$ {{ (Number(pedido.troco) - Number(pedido.total)).toFixed(2) }}</span>
            </div>
            <div v-else class="text-[10px] text-blue-600 font-medium">
              ℹ️ Não precisa de troco
            </div>
          </div>

          <!-- Tempo Estimado -->
          <div v-if="pedido?.tempoEstimado" class="text-[10px] text-muted-foreground text-center py-0.5">
            ⏱️ Tempo estimado: {{ pedido.tempoEstimado }} minutos
          </div>

          <!-- Observações -->
          <div v-if="pedido?.observacao" class="bg-yellow-50 dark:bg-yellow-900/20 rounded p-1.5 border border-yellow-200 dark:border-yellow-800">
            <h4 class="font-medium text-[10px] text-foreground mb-0.5">Observações</h4>
            <p class="text-xs text-foreground leading-tight">{{ pedido.observacao }}</p>
          </div>
        </div>
      </div>

      <!-- Footer Ultra Compacto -->
      <div class="px-2 py-2 border-t border-border bg-muted/20">
        <div class="flex flex-col gap-1.5">
          <!-- Botões de mudança de status -->
          <template v-if="pedido?.status === 'novo'">
            <button
              @click="acceptPedido"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
            >
              ✅ Aceitar Pedido
            </button>
          </template>
          
          <template v-else-if="pedido?.status === 'cozinha'">
            <button
              @click="markPedidoAsReady"
              class="w-full bg-orange-600 hover:bg-orange-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <font-awesome-icon icon="utensils" class="w-2.5 h-2.5" />
              Marcar como Pronto
            </button>
          </template>
          
          <template v-else-if="pedido?.status === 'entrega'">
            <button
              @click="completePedido"
              class="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <font-awesome-icon icon="check-circle" class="w-2.5 h-2.5" />
              Concluir Entrega
            </button>
          </template>

          <!-- Botão de imprimir centralizado -->
          <button
            @click="printPedido"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <font-awesome-icon icon="print" class="w-2.5 h-2.5" />
            Imprimir Pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePedidos } from '~/composables/usePedidos'

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
  status: 'novo' | 'cozinha' | 'entrega' | 'concluido'
  observacao?: string
  troco?: number
  dataHora: Date
  tempoEstimado?: number
  valorEntrega?: number
}

interface Props {
  pedido: Pedido | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  print: [pedido: Pedido]
  accept: [pedidoId: string]
  ready: [pedidoId: string]
  complete: [pedidoId: string]
}>()

// Buscar configurações da empresa
const { buscarConfiguracoes } = useEmpresa()
const configEmpresa = ref<any>(null)

onMounted(async () => {
  configEmpresa.value = await buscarConfiguracoes()
  
  // Debug: Verificar dados do pedido ao montar o componente
  console.log('🔍 [PedidoModal] Pedido recebido:', {
    numero: props.pedido?.numero,
    cliente: props.pedido?.cliente,
    items: props.pedido?.items,
    itemsLength: props.pedido?.items?.length,
    total: props.pedido?.total
  })
})

// Funções que emitem eventos para o componente pai (como os botões da tela principal)
const acceptPedido = () => {
  if (props.pedido) {
    emit('accept', props.pedido.id)
    emit('close')
  }
}

const markPedidoAsReady = () => {
  if (props.pedido) {
    emit('ready', props.pedido.id)
    emit('close')
  }
}

const completePedido = () => {
  if (props.pedido) {
    emit('complete', props.pedido.id)
    emit('close')
  }
}

const updateStatus = (newStatus: string) => {
  alert(`🔥 MODAL: Botão clicado! Status: ${newStatus}`)
  console.log(`[PedidoModal] updateStatus chamado: ${newStatus}`, props.pedido)
  
  if (props.pedido) {
    console.log(`[PedidoModal] Emitindo evento update-status: ${props.pedido.id} -> ${newStatus}`)
    emit('update-status', props.pedido.id, newStatus)
    alert(`📡 MODAL: Evento emitido! ${props.pedido.id} -> ${newStatus}`)
  } else {
    console.error('[PedidoModal] Nenhum pedido encontrado para atualizar')
  }
}

const getStatusLabel = (status: string) => {
  const labels = {
    novo: 'Novo',
    cozinha: 'Na Cozinha',
    entrega: 'Saiu para Entrega',
    concluido: 'Concluído'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusColor = (status: string) => {
  const colors = {
    novo: 'bg-blue-100 text-blue-700',
    cozinha: 'bg-orange-100 text-orange-700',
    entrega: 'bg-purple-100 text-purple-700',
    concluido: 'bg-green-100 text-green-700'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

const getPaymentLabel = (payment: string) => {
  const labels = {
    dinheiro: 'Dinheiro',
    cartao: 'Cartão',
    pix: 'PIX'
  }
  return labels[payment as keyof typeof labels] || payment
}

const getPaymentColor = (payment: string) => {
  const colors = {
    dinheiro: 'bg-green-100 text-green-700',
    cartao: 'bg-purple-100 text-purple-700',
    pix: 'bg-orange-100 text-orange-700'
  }
  return colors[payment as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

const printPedido = () => {
  if (!props.pedido) {
    console.error('Nenhum pedido selecionado para imprimir')
    return
  }
  
  // Debug: Verificar dados do pedido
  console.log('Imprimindo pedido:', {
    numero: props.pedido.numero,
    cliente: props.pedido.cliente,
    telefone: props.pedido.telefone,
    items: props.pedido.items,
    itemsLength: props.pedido.items?.length,
    total: props.pedido.total
  })
  
  // Verificar se items existe e tem conteúdo
  if (!props.pedido.items || props.pedido.items.length === 0) {
    console.error('AVISO: Pedido sem itens!', props.pedido)
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
      <title>Pedido #${props.pedido.numero}</title>
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
          <span><strong style="color: #000;">Pedido:</strong> #${props.pedido.numero}</span>
          <span><strong style="color: #000;">Data:</strong> ${formatDateTime(props.pedido.dataHora)}</span>
        </div>
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <div class="section-title">CLIENTE:</div>
        <div style="margin-bottom: 2px; color: #444;">
          <strong style="color: #000;">Nome:</strong> ${props.pedido.cliente}
        </div>
        <div style="margin-bottom: 2px; color: #444;">
          <strong style="color: #000;">Telefone:</strong> ${props.pedido.telefone}
        </div>
        ${props.pedido.endereco ? `
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #ccc; color: #444;">
            <strong style="color: #000;">Endereço:</strong><br/>
            ${props.pedido.endereco}
          </div>
        ` : '<div style="margin-top: 4px; padding: 4px; background: #f0f0f0; text-align: center;"><strong>RETIRADA NO BALCÃO</strong></div>'}
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <div class="section-title">ITENS:</div>
        ${props.pedido.items && props.pedido.items.length > 0 
          ? props.pedido.items.map((item, index) => `
            <div class="item-wrapper">
              <div class="item-line">
                <span class="item-name">${item.quantidade}x ${item.nome}</span>
                <span class="item-price">R$ ${(item.quantidade * item.preco).toFixed(2)}</span>
              </div>
              ${item.observacao ? `<div class="obs">Obs: ${item.observacao}</div>` : ''}
              ${index < props.pedido.items.length - 1 ? '<div class="item-separator">...................................</div>' : ''}
            </div>
          `).join('')
          : '<div style="padding: 8px; text-align: center; color: #999;">Nenhum item encontrado</div>'
        }
      </div>
      
      <div class="separator"></div>
      
      <div class="section">
        <div class="item-line">
          <span style="color: #444;"><strong style="color: #000;">Subtotal:</strong></span>
          <span style="color: #444;">R$ ${(props.pedido.total - (props.pedido.valorEntrega || 0)).toFixed(2)}</span>
        </div>
        ${props.pedido.tipoEntrega === 'entrega' && props.pedido.valorEntrega ? `
          <div class="item-line">
            <span style="color: #444;"><strong style="color: #000;">Taxa de entrega:</strong></span>
            <span style="color: #444;">R$ ${props.pedido.valorEntrega.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="item-line total-line">
          <span><strong>TOTAL:</strong></span>
          <span>R$ ${props.pedido.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="section">
        <div style="color: #444;"><strong style="color: #000;">Pagamento:</strong> ${getPaymentLabel(props.pedido.formaPagamento).toUpperCase()}</div>
        <div style="color: #444;"><strong style="color: #000;">Tipo:</strong> ${props.pedido.tipoEntrega === 'entrega' ? 'ENTREGA' : 'RETIRADA'}</div>
        ${props.pedido.troco ? `
          <div style="color: #444;"><strong style="color: #000;">Troco para:</strong> R$ ${Number(props.pedido.troco).toFixed(2)}</div>
          ${Number(props.pedido.troco) > Number(props.pedido.total) 
            ? `<div style="color: #444;"><strong style="color: #000;">Troco:</strong> R$ ${(Number(props.pedido.troco) - Number(props.pedido.total)).toFixed(2)}</div>`
            : `<div style="color: #444;"><strong style="color: #000;">Não precisa de troco</strong></div>`
          }
        ` : ''}
        ${props.pedido.tempoEstimado ? `<div style="color: #444;"><strong style="color: #000;">Tempo estimado:</strong> ${props.pedido.tempoEstimado} min</div>` : ''}
      </div>
      
      ${props.pedido.observacao ? `
        <div class="separator"></div>
        <div class="section">
          <div class="section-title">OBSERVAÇÕES:</div>
          <div class="obs">${props.pedido.observacao}</div>
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
  
  console.log(`Imprimindo pedido #${props.pedido.numero}`)
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

// Fechar modal com ESC
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      emit('close')
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>
