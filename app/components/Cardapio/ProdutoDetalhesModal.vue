<script setup lang="ts">
import type { ProdutoPublico, GrupoComplementoSelecionado } from '../../../shared/types/cardapio'

interface Props {
  produto: ProdutoPublico
}

const props = defineProps<Props>()
const emit = defineEmits<{
  fechar: []
}>()

const { adicionarItem, verificarMudancaPreco } = useCarrinho()

// Estado do modal de alerta de preço
const mostrarAlertaPreco = ref(false)
const dadosAlertaPreco = ref<{ precoAntigo: number, precoAtual: number } | null>(null)

// Toast
const toast = ref<any>(null)

// Estado do formulário
const tamanhoSelecionado = ref<'P' | 'G' | 'F' | null>(null)
const complementosSelecionados = ref<Map<string, Set<string>>>(new Map())
const observacoes = ref('')
const quantidade = ref(1)

// Inicializar tamanho padrão para produtos por tamanho e carregar toast
onMounted(async () => {
  if (props.produto.tipo === 'pizza' && props.produto.tamanhos && props.produto.tamanhos.length > 0) {
    tamanhoSelecionado.value = props.produto.tamanhos[0].tamanho
  }
  toast.value = await useToastSafe()
})

// Preço do tamanho selecionado ou preço fixo
const precoBase = computed(() => {
  if (props.produto.tipo === 'comum') {
    return props.produto.promocao_ativa && props.produto.preco_promocional
      ? props.produto.preco_promocional
      : props.produto.preco || 0
  } else {
    const tamanho = props.produto.tamanhos?.find(t => t.tamanho === tamanhoSelecionado.value)
    return tamanho?.preco || 0
  }
})

// Calcular valor dos complementos
const valorComplementos = computed(() => {
  let total = 0
  complementosSelecionados.value.forEach((complementosIds, grupoId) => {
    const grupo = props.produto.grupos_complementos?.find(g => g.id === grupoId)
    if (grupo) {
      complementosIds.forEach(compId => {
        const complemento = grupo.complementos.find(c => c.id === compId)
        if (complemento) total += complemento.preco
      })
    }
  })
  return total
})

// Total do item
const totalItem = computed(() => {
  return (precoBase.value + valorComplementos.value) * quantidade.value
})

// Toggle complemento
const toggleComplemento = (grupoId: string, complementoId: string, maximo: number) => {
  if (!complementosSelecionados.value.has(grupoId)) {
    complementosSelecionados.value.set(grupoId, new Set())
  }
  
  const selecionados = complementosSelecionados.value.get(grupoId)!
  
  if (selecionados.has(complementoId)) {
    selecionados.delete(complementoId)
  } else {
    if (selecionados.size >= maximo) {
      if (toast.value && typeof toast.value.warning === 'function') {
        toast.value.warning(`Você pode selecionar no máximo ${maximo} ${maximo === 1 ? 'item' : 'itens'}`)
      }
      return
    }
    selecionados.add(complementoId)
  }
}

// Processar adição ao carrinho (após confirmação ou diretamente)
const processarAdicao = () => {
  try {
    // Montar complementos para o carrinho
    const complementos: GrupoComplementoSelecionado[] = []
    complementosSelecionados.value.forEach((complementosIds, grupoId) => {
      const grupo = props.produto.grupos_complementos?.find(g => g.id === grupoId)
      if (grupo && complementosIds.size > 0) {
        complementos.push({
          grupo_id: grupo.id,
          grupo_nome: grupo.nome,
          itens: Array.from(complementosIds).map(compId => {
            const comp = grupo.complementos.find(c => c.id === compId)!
            return {
              id: comp.id,
              nome: comp.nome,
              preco: comp.preco
            }
          })
        })
      }
    })

    // Adicionar ao carrinho
    adicionarItem({
      produto_id: props.produto.id,
      nome: props.produto.nome,
      descricao: props.produto.descricao,
      imagem: props.produto.imagem || null,
      tamanho: tamanhoSelecionado.value || undefined,
      preco_unitario: precoBase.value,
      quantidade: quantidade.value,
      complementos,
      observacoes: observacoes.value || undefined
    })

    // Fechar modal primeiro
    mostrarAlertaPreco.value = false
    emit('fechar')
    
    // Toast depois de fechar
    setTimeout(() => {
      if (toast.value && typeof toast.value.success === 'function') {
        toast.value.success('Item adicionado ao carrinho!')
      }
    }, 100)
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)
    if (toast.value && typeof toast.value.error === 'function') {
      toast.value.error('Erro ao adicionar item ao carrinho')
    }
  }
}

// Validar e adicionar ao carrinho
const adicionarAoCarrinho = () => {
  try {
    console.log('🔍 Iniciando adição ao carrinho')
    
    // Validar tamanho
    if (props.produto.tipo === 'pizza' && !tamanhoSelecionado.value) {
      if (toast.value && typeof toast.value.warning === 'function') {
        toast.value.warning('Selecione um tamanho')
      }
      return
    }

    // Validar grupos obrigatórios
    const gruposObrigatorios = props.produto.grupos_complementos?.filter(g => g.obrigatorio) || []
    console.log('📋 Grupos obrigatórios:', gruposObrigatorios.length)
    
    for (const grupo of gruposObrigatorios) {
      const selecionados = complementosSelecionados.value.get(grupo.id)
      const qtd = selecionados?.size || 0
      const minimo = grupo.min_opcoes || 1
      
      console.log(`🔍 Grupo "${grupo.nome}": ${qtd}/${minimo} itens`)
      
      if (qtd < minimo) {
        if (toast.value && typeof toast.value.warning === 'function') {
          toast.value.warning(`Selecione pelo menos ${minimo} ${minimo === 1 ? 'item' : 'itens'} em "${grupo.nome}"`)
        }
        return
      }
    }

    console.log('✅ Validações OK')

    // Verificar se há mudança de preço
    const verificacao = verificarMudancaPreco(props.produto.id, precoBase.value)
    console.log('💰 Verificação de preço:', verificacao)
    
    if (verificacao.temNoCarrinho && verificacao.precoAntigo !== undefined && verificacao.diferenca && verificacao.diferenca > 0.01) {
      console.log('⚠️ Preço diferente detectado, mostrando modal')
      // Mostrar modal de alerta
      dadosAlertaPreco.value = {
        precoAntigo: verificacao.precoAntigo,
        precoAtual: precoBase.value
      }
      mostrarAlertaPreco.value = true
      return
    }

    console.log('✅ Processando adição direta')
    // Se não há mudança, adicionar direto
    processarAdicao()
  } catch (error) {
    console.error('❌ Erro ao adicionar ao carrinho:', error)
    if (toast.value && typeof toast.value.error === 'function') {
      toast.value.error('Erro ao adicionar item')
    }
  }
}

// Confirmar adição com preço diferente
const confirmarAdicaoComPrecoNovo = () => {
  processarAdicao()
}

// Cancelar adição
const cancelarAdicao = () => {
  mostrarAlertaPreco.value = false
  dadosAlertaPreco.value = null
}

// Fechar ao pressionar ESC
const fecharComEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('fechar')
}

onMounted(() => {
  document.addEventListener('keydown', fecharComEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', fecharComEsc)
})
</script>

<template>
  <Teleport to="body">
    <div 
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      @click="emit('fechar')"
    >
      <div 
        class="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ produto.nome }}
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
        <div class="p-6 space-y-6">
          <!-- Imagem -->
          <div v-if="produto.imagem" class="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img 
              :src="produto.imagem" 
              :alt="produto.nome"
              class="w-full h-full object-cover"
            >
          </div>

          <!-- Descrição -->
          <div v-if="produto.descricao">
            <p class="text-gray-600 dark:text-gray-400">
              {{ produto.descricao }}
            </p>
          </div>

          <!-- Seleção de Tamanho (para pizzas) -->
          <div v-if="produto.tipo === 'pizza' && produto.tamanhos">
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              Escolha o tamanho <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="tamanho in produto.tamanhos"
                :key="tamanho.tamanho"
                @click="tamanhoSelecionado = tamanho.tamanho"
                :class="[
                  'p-4 rounded-xl border-2 transition-all',
                  tamanhoSelecionado === tamanho.tamanho
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                ]"
              >
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {{ tamanho.tamanho }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    R$ {{ tamanho.preco.toFixed(2) }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Grupos de Complementos -->
          <div 
            v-for="grupo in produto.grupos_complementos"
            :key="grupo.id"
            class="border-t border-gray-200 dark:border-gray-700 pt-6"
          >
            <div class="mb-3">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ grupo.nome }}
                <span v-if="grupo.obrigatorio" class="text-red-500">*</span>
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ grupo.obrigatorio ? 'Obrigatório' : 'Opcional' }}
                • Escolha 
                <template v-if="grupo.min_opcoes === grupo.max_opcoes">
                  {{ grupo.min_opcoes }}
                </template>
                <template v-else>
                  de {{ grupo.min_opcoes }} até {{ grupo.max_opcoes || '∞' }}
                </template>
              </p>
            </div>

            <div class="space-y-2">
              <label
                v-for="complemento in grupo.complementos?.filter(c => c.ativo !== false) || []"
                :key="complemento.id"
                class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 cursor-pointer transition-colors"
                :class="complementosSelecionados.get(grupo.id)?.has(complemento.id) ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' : ''"
              >
                <div class="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    :checked="complementosSelecionados.get(grupo.id)?.has(complemento.id)"
                    @change="toggleComplemento(grupo.id, complemento.id, grupo.max_opcoes || 999)"
                    class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                  >
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ complemento.nome }}
                  </span>
                </div>
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {{ complemento.preco > 0 ? `+ R$ ${complemento.preco.toFixed(2)}` : 'Grátis' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Observações -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Observações (opcional)
            </label>
            <textarea
              v-model="observacoes"
              rows="3"
              placeholder="Ex: tirar cebola, ponto da carne, etc."
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Controle de Quantidade -->
            <div class="flex items-center gap-3">
              <button
                @click="quantidade = Math.max(1, quantidade - 1)"
                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="text-xl font-bold w-8 text-center">{{ quantidade }}</span>
              <button
                @click="quantidade++"
                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- Botão Adicionar -->
            <button
              @click="adicionarAoCarrinho"
              class="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Adicionar</span>
              <span>R$ {{ totalItem.toFixed(2) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Alerta de Preço -->
    <CardapioModalAlertaPreco
      v-if="mostrarAlertaPreco && dadosAlertaPreco"
      :nome-produto="produto.nome"
      :preco-antigo="dadosAlertaPreco.precoAntigo"
      :preco-atual="dadosAlertaPreco.precoAtual"
      @confirmar="confirmarAdicaoComPrecoNovo"
      @cancelar="cancelarAdicao"
    />
  </Teleport>
</template>
