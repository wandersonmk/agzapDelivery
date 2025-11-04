<template>
  <div class="w-full">
    <!-- Cards de Métricas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Card Total de Pedidos -->
      <div class="relative bg-gradient-to-br from-card via-green-950/10 to-card text-card-foreground rounded-lg border border-green-800/20 shadow-sm hover:shadow-md hover:shadow-green-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Total de Pedidos</p>
            <p class="text-3xl font-bold text-foreground">{{ totalPedidos }}</p>
            <p class="text-xs text-green-600 mt-1">registrados</p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Card Valor Total -->
      <div class="relative bg-gradient-to-br from-card via-blue-950/10 to-card text-card-foreground rounded-lg border border-blue-800/20 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Valor Total</p>
            <p class="text-3xl font-bold text-foreground">R$ {{ totalValor.toFixed(2).replace('.', ',') }}</p>
            <p class="text-xs text-blue-600 mt-1">faturado</p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Card Ticket Médio -->
      <div class="relative bg-gradient-to-br from-card via-purple-950/10 to-card text-card-foreground rounded-lg border border-purple-800/20 shadow-sm hover:shadow-md hover:shadow-purple-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Ticket Médio</p>
            <p class="text-3xl font-bold text-foreground">R$ {{ ticketMedio.toFixed(2).replace('.', ',') }}</p>
            <p class="text-xs text-purple-600 mt-1">por pedido</p>
          </div>
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-6">
      <FiltrosPedidos v-model="filtros">
        <template #acoes>
          <div class="flex gap-2">
            <button
              @click="exportarPDF"
              :disabled="isExportingPDF || isExportingExcel"
              class="group relative flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Exportar relatório em PDF"
            >
              <i v-if="!isExportingPDF" class="fas fa-file-pdf"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span class="font-medium text-sm">{{ isExportingPDF ? 'Gerando...' : 'PDF' }}</span>
            </button>

            <button
              @click="exportarExcel"
              :disabled="isExportingPDF || isExportingExcel"
              class="group relative flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Exportar relatório em Excel"
            >
              <i v-if="!isExportingExcel" class="fas fa-file-excel"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span class="font-medium text-sm">{{ isExportingExcel ? 'Gerando...' : 'Excel' }}</span>
            </button>
          </div>
        </template>
      </FiltrosPedidos>
    </div>

    <!-- Tabela de Pedidos - Container com largura máxima removida -->
    <div class="mb-8">
      <TabelaPedidos 
        :pedidos="pedidos"
        :filtros="filtros"
        @pedido-click="abrirDetalhesPedido"
      />
    </div>

    <!-- Cards de AnÃ¡lise -->
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Clientes -->
      <div class="bg-card rounded-lg shadow-sm border border-border">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            <i class="fas fa-users mr-2 text-green-600"></i>
            Top Clientes
          </h3>
        </div>
        <div class="p-6">
          <div 
            v-for="(cliente, index) in topClientes" 
            :key="cliente.nome" 
            @click="abrirDetalhesCliente(cliente)"
            class="flex items-center justify-between py-2 cursor-pointer hover:bg-muted/50 rounded-lg px-3 transition-colors"
          >
            <div class="flex items-center">
              <span class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3" 
                    :class="index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'">
                {{ index + 1 }}
              </span>
              <span class="text-sm font-medium text-foreground">{{ cliente.nome }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-foreground">{{ cliente.pedidos }} pedidos</div>
              <div class="text-xs text-muted-foreground">R$ {{ cliente.valor.toFixed(2).replace('.', ',') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- AnÃ¡lise de Pagamentos -->
      <div class="bg-card rounded-lg shadow-sm border border-border">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            <i class="fas fa-credit-card mr-2 text-blue-600"></i>
            Formas de Pagamento
          </h3>
        </div>
        <div class="p-6">
          <div v-for="pagamento in analisePagamentos" :key="pagamento.tipo" class="flex items-center justify-between py-2">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded mr-3" :class="{
                'bg-green-500': pagamento.tipo === 'dinheiro',
                'bg-blue-500': pagamento.tipo === 'cartao',
                'bg-orange-500': pagamento.tipo === 'pix'
              }"></div>
              <span class="text-sm font-medium text-foreground">{{ pagamento.label }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-foreground">{{ pagamento.pedidos }} pedidos</div>
              <div class="text-xs text-muted-foreground">{{ pagamento.percentual }}%</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Modal de Detalhes do Cliente -->
    <ModalDetalhesCliente
      :isOpen="isModalClienteOpen"
      :cliente="clienteSelecionado"
      @close="fecharDetalhesCliente"
    />

    <!-- Modal de Detalhes do Pedido -->
    <PedidoModal
      v-if="isModalPedidoOpen && pedidoSelecionado"
      :pedido="pedidoSelecionado"
      @close="fecharDetalhesPedido"
    />
  </div>
</template>

<script setup lang="ts">
import type { EstatisticasRelatorio } from '~/composables/useRelatorios'

// Layout e permissões
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth', 'permissions']
})

// Definir título da página
useHead({
  title: 'Relatórios'
})

// Interfaces
interface Filtros {
  dataInicio?: string
  dataFim?: string
  numeroPedido?: string
  nomeCliente?: string
  formaPagamento?: string
  tipoRetirada?: string
}

// State
const filtros = ref<Filtros>({})
const isExportingPDF = ref(false)
const isExportingExcel = ref(false)
const isModalClienteOpen = ref(false)
const clienteSelecionado = ref<any>(null)

// Composables
const { estatisticas, pedidosDetalhados, isLoading, buscarEstatisticas } = useRelatorios()
const { exportarRelatoriosPDF } = usePDFExport()
const { exportarRelatoriosExcel } = useExcelExport()
const { showToast } = useToastSafe()

// Supabase client - apenas no lado do cliente
const supabase = process.client ? useSupabaseClient() : null

// Computed
const totalPedidos = computed(() => estatisticas.value?.totalPedidos || 0)
const totalValor = computed(() => estatisticas.value?.totalValor || 0)
const ticketMedio = computed(() => estatisticas.value?.ticketMedio || 0)
const topClientes = computed(() => estatisticas.value?.topClientes || [])
const analisePagamentos = computed(() => estatisticas.value?.analisePagamentos || [])
const pedidos = computed(() => pedidosDetalhados.value || [])

// Methods
const carregarDados = async () => {
  await buscarEstatisticas()
}

// Função para exportar em PDF
const exportarPDF = async () => {
  try {
    if (!pedidos.value || pedidos.value.length === 0) {
      showToast('Nenhum pedido para exportar', 'warning')
      return
    }

    isExportingPDF.value = true
    const configEmpresa = await buscarConfiguracoes()
    const resultado = await exportarRelatoriosPDF(pedidos.value, estatisticas.value, configEmpresa)
    
    if (resultado.success) {
      showToast(`PDF gerado com sucesso! ${resultado.totalPedidos} pedidos exportados.`, 'success')
    }
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    showToast('Erro ao gerar PDF. Tente novamente.', 'error')
  } finally {
    isExportingPDF.value = false
  }
}

// Função para exportar em Excel
const exportarExcel = async () => {
  try {
    if (!pedidos.value || pedidos.value.length === 0) {
      showToast('Nenhum pedido para exportar', 'warning')
      return
    }

    isExportingExcel.value = true
    const resultado = await exportarRelatoriosExcel(pedidos.value, estatisticas.value)
    
    if (resultado.success) {
      showToast(`Excel gerado com sucesso! ${resultado.totalPedidos} pedidos exportados.`, 'success')
    }
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    showToast('Erro ao gerar Excel. Tente novamente.', 'error')
  } finally {
    isExportingExcel.value = false
  }
}

// Funções do modal de cliente
const abrirDetalhesCliente = async (cliente: any) => {
  try {
    if (!supabase) {
      console.error('Supabase client não disponível')
      return
    }
    
    console.log('Abrindo detalhes do cliente:', cliente)
    
    // Buscar mais detalhes do cliente no banco de dados
    const { data: clienteDetalhado, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', cliente.telefone)
      .single()
    
    // Buscar a data do primeiro pedido do cliente
    const { data: primeiroPedido } = await supabase
      .from('pedidos')
      .select('created_at')
      .eq('telefone_cliente', cliente.telefone)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    
    console.log('Cliente detalhado do banco:', clienteDetalhado, 'Erro:', error)
    console.log('Primeiro pedido:', primeiroPedido)
    
    if (error) {
      console.error('Erro ao buscar detalhes do cliente:', error)
      // Usar dados básicos se não conseguir buscar detalhes
      clienteSelecionado.value = {
        nome: cliente.nome,
        telefone: cliente.telefone,
        qtdPedidos: cliente.pedidos,
        valor: cliente.valor,
        created_at: primeiroPedido?.created_at
      }
    } else {
      // Combinar dados do relatório com dados do banco
      clienteSelecionado.value = {
        ...clienteDetalhado,
        qtdPedidos: cliente.pedidos,
        valor: cliente.valor,
        // Usar data do primeiro pedido se não houver created_at no cliente
        created_at: clienteDetalhado.created_at || primeiroPedido?.created_at
      }
    }
    
    console.log('Cliente selecionado final:', clienteSelecionado.value)
    isModalClienteOpen.value = true
  } catch (err) {
    console.error('Erro ao abrir detalhes do cliente:', err)
    showToast('Erro ao carregar detalhes do cliente', 'error')
  }
}

const fecharDetalhesCliente = () => {
  isModalClienteOpen.value = false
  clienteSelecionado.value = null
}

// Funções do modal de pedido
const pedidoSelecionado = ref<any>(null)
const isModalPedidoOpen = ref(false)

const abrirDetalhesPedido = (pedido: any) => {
  console.log('Abrindo detalhes do pedido:', pedido)
  
  // Transformar dados da tabela de pedidos para o formato do PedidoModal
  let items = []
  
  try {
    // O campo 'pedido' contém texto simples, não JSON
    // Formato: "2x Pizza Margherita - R$ 52,64, 1x Coca Cola - R$ 8,00"
    const pedidoText = pedido.pedido || ''
    
    if (pedidoText) {
      // Parse suporta quebras de linha OU vírgula seguida de "Nx "
      const itemsTexto = pedidoText
        .split(/\n|,\s+(?=\d+x\s)/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
      
      itemsTexto.forEach((itemTexto: string) => {
        // Regex para capturar: quantidade, nome e preço
        const matchComPreco = itemTexto.match(/^(\d+)x\s+(.+?)\s+-\s+R\$\s+([\d,\.]+)$/)
        
        if (matchComPreco && matchComPreco[1] && matchComPreco[2] && matchComPreco[3]) {
          const quantidade = parseInt(matchComPreco[1])
          const nome = matchComPreco[2].trim()
          const precoStr = matchComPreco[3].replace(',', '.')
          const precoTotal = parseFloat(precoStr)
          
          items.push({
            nome,
            quantidade,
            preco: precoTotal / quantidade,
            observacao: undefined
          })
        } else {
          // Tenta match sem preço: "2x Pizza Margherita"
          const matchSemPreco = itemTexto.match(/^(\d+)x\s+(.+)$/)
          
          if (matchSemPreco && matchSemPreco[1] && matchSemPreco[2]) {
            const quantidade = parseInt(matchSemPreco[1])
            const nome = matchSemPreco[2].trim()
            const valorSemEntrega = parseFloat(pedido.valor_total || 0) - parseFloat(pedido.valor_entrega || 0)
            const precoEstimado = valorSemEntrega / itemsTexto.length
            
            items.push({
              nome,
              quantidade,
              preco: precoEstimado / quantidade,
              observacao: undefined
            })
          }
        }
      })
    }
    
    console.log('Items parseados:', items)
  } catch (e) {
    console.error('Erro ao fazer parse dos itens do pedido:', e)
    items = []
  }
  
  // Transformar para o formato esperado pelo modal
  const pedidoFormatado = {
    id: pedido.id,
    numero: pedido.numero_pedido,
    cliente: pedido.nome_cliente,
    telefone: pedido.telefone_cliente || 'Não informado',
    endereco: pedido.endereco_entrega,
    items: items,
    total: parseFloat(pedido.valor_total || 0),
    formaPagamento: pedido.forma_pagamento,
    tipoEntrega: pedido.tipo_retirada,
    status: 'concluido', // Pedidos do relatório são considerados concluídos
    observacao: pedido.observacao,
    troco: pedido.troco ? parseFloat(pedido.troco) : undefined,
    dataHora: new Date(pedido.created_at),
    valorEntrega: pedido.valor_entrega ? parseFloat(pedido.valor_entrega) : undefined
  }
  
  console.log('Pedido formatado:', pedidoFormatado)
  pedidoSelecionado.value = pedidoFormatado
  isModalPedidoOpen.value = true
}

const fecharDetalhesPedido = () => {
  isModalPedidoOpen.value = false
  pedidoSelecionado.value = null
}

// Lifecycle
onMounted(async () => {
  await carregarDados()
})
</script>
