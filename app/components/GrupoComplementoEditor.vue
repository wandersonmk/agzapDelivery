<template>
  <div class="border border-border rounded-lg overflow-hidden bg-card">
    <!-- Cabeçalho do Grupo -->
    <div class="p-4 bg-muted/10 border-b border-border">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-foreground">{{ grupo.nome }}</h3>
          <p v-if="grupo.descricao" class="text-xs text-muted-foreground mt-0.5">
            {{ grupo.descricao }}
          </p>
        </div>
        <button
          @click="$emit('editar-grupo', grupo)"
          class="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          <font-awesome-icon icon="cog" class="w-3 h-3" />
          <span>Configurar</span>
        </button>
      </div>

      <!-- Configurações do Grupo -->
      <div class="flex items-center gap-3 flex-wrap text-xs">
        <div class="flex items-center gap-2">
          <label class="text-muted-foreground">Tipo:</label>
          <select
            :value="grupo.obrigatorio"
            @change="atualizarGrupo({ obrigatorio: ($event.target as HTMLSelectElement).value === 'true' })"
            class="px-2 py-1 bg-background border border-border rounded text-foreground"
          >
            <option value="false">Opcional</option>
            <option value="true">Obrigatório</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-muted-foreground">Qtd. mínima:</label>
          <input
            type="number"
            :value="grupo.min_opcoes"
            @input="atualizarMinOpcoes(($event.target as HTMLInputElement).value)"
            :min="grupo.obrigatorio ? 1 : 0"
            class="w-16 px-2 py-1 bg-background border border-border rounded text-foreground text-center"
          />
          <span v-if="grupo.obrigatorio && grupo.min_opcoes === 0" class="text-xs text-red-500">
            (Obrigatório: mín. 1)
          </span>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-muted-foreground">Qtd. máxima:</label>
          <input
            type="number"
            :value="grupo.max_opcoes || ''"
            @input="atualizarGrupo({ max_opcoes: parseInt(($event.target as HTMLInputElement).value) || null })"
            min="0"
            placeholder="Ilimitado"
            class="w-20 px-2 py-1 bg-background border border-border rounded text-foreground text-center"
          />
        </div>
      </div>
    </div>

    <!-- Lista de Complementos -->
    <div class="p-4">
      <!-- Cabeçalho da Tabela -->
      <div class="grid grid-cols-12 gap-3 pb-2 mb-2 border-b border-border text-xs font-medium text-muted-foreground">
        <div class="col-span-5">Produto</div>
        <div class="col-span-3">Preço</div>
        <div class="col-span-2">Status</div>
        <div class="col-span-2 text-right">Ações</div>
      </div>

      <!-- Complementos Existentes -->
      <div class="space-y-2">
        <div
          v-for="complemento in complementosOrdenados"
          :key="complemento.id"
          class="grid grid-cols-12 gap-3 items-center py-2 px-2 rounded hover:bg-muted/10 transition-colors"
        >
          <!-- Nome do Complemento -->
          <div class="col-span-5">
            <input
              v-if="complementoEditando?.id === complemento.id"
              v-model="formEditComplemento.nome"
              type="text"
              class="w-full px-2 py-1 text-sm bg-background border border-primary rounded text-foreground"
              @keyup.enter="salvarEdicaoComplemento"
              @keyup.esc="cancelarEdicaoComplemento"
            />
            <p v-else class="text-sm text-foreground truncate">{{ complemento.nome }}</p>
          </div>

          <!-- Preço -->
          <div class="col-span-3">
            <div v-if="complementoEditando?.id === complemento.id" class="relative">
              <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
              <input
                v-model="precoEditFormatado"
                type="text"
                class="w-full pl-7 pr-2 py-1 text-sm bg-background border border-primary rounded text-foreground"
                @keyup.enter="salvarEdicaoComplemento"
                @keyup.esc="cancelarEdicaoComplemento"
              />
            </div>
            <span v-else class="text-sm font-medium" :class="complemento.preco > 0 ? 'text-primary' : 'text-muted-foreground'">
              {{ complemento.preco > 0 ? `+R$ ${complemento.preco.toFixed(2).replace('.', ',')}` : 'Grátis' }}
            </span>
          </div>

          <!-- Status -->
          <div class="col-span-2">
            <button
              @click="toggleStatusComplemento(complemento)"
              class="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
              :class="complemento.ativo 
                ? 'bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30' 
                : 'bg-gray-500/20 text-gray-700 dark:text-gray-300 hover:bg-gray-500/30'"
            >
              <font-awesome-icon :icon="complemento.ativo ? 'eye' : 'eye-slash'" class="w-3 h-3" />
              <span>{{ complemento.ativo ? 'Ativo' : 'Inativo' }}</span>
            </button>
          </div>

          <!-- Ações -->
          <div class="col-span-2 flex items-center justify-end gap-1">
            <template v-if="complementoEditando?.id === complemento.id">
              <button
                @click="salvarEdicaoComplemento"
                class="p-1.5 text-green-600 hover:bg-green-500/10 rounded transition-colors"
                title="Salvar"
              >
                <font-awesome-icon icon="check" class="w-3 h-3" />
              </button>
              <button
                @click="cancelarEdicaoComplemento"
                class="p-1.5 text-gray-600 hover:bg-gray-500/10 rounded transition-colors"
                title="Cancelar"
              >
                <font-awesome-icon icon="times" class="w-3 h-3" />
              </button>
            </template>
            <template v-else>
              <button
                @click="iniciarEdicaoComplemento(complemento)"
                class="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                title="Editar"
              >
                <font-awesome-icon icon="edit" class="w-3 h-3" />
              </button>
              <button
                @click="confirmarExcluirComplemento(complemento)"
                class="p-1.5 text-red-600 hover:bg-red-500/10 rounded transition-colors"
                title="Excluir"
              >
                <font-awesome-icon icon="trash" class="w-3 h-3" />
              </button>
            </template>
          </div>
        </div>

        <!-- Mensagem quando vazio -->
        <div v-if="complementosOrdenados.length === 0" class="text-center py-6 text-muted-foreground text-sm">
          <p>Nenhum complemento neste grupo</p>
        </div>
      </div>

      <!-- Formulário para Novo Complemento -->
      <div v-if="mostrandoFormNovo" class="mt-4 p-3 bg-primary/5 border border-primary/30 rounded-lg">
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-foreground mb-1">Nome do Complemento *</label>
            <input
              v-model="formNovoComplemento.nome"
              type="text"
              placeholder="Ex: Bacon, Queijo Extra..."
              class="w-full px-3 py-2 text-sm bg-background border border-border rounded text-foreground"
              @keyup.enter="salvarNovoComplemento"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Preço</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                <input
                  v-model="precoNovoFormatado"
                  type="text"
                  placeholder="0,00"
                  class="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded text-foreground"
                  @keyup.enter="salvarNovoComplemento"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-foreground mb-1">Status</label>
              <select
                v-model="formNovoComplemento.ativo"
                class="w-full px-3 py-2 text-sm bg-background border border-border rounded text-foreground"
              >
                <option :value="true">Ativo</option>
                <option :value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              @click="cancelarNovoComplemento"
              class="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded hover:bg-muted/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="salvarNovoComplemento"
              :disabled="!formNovoComplemento.nome.trim()"
              class="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <font-awesome-icon icon="check" class="w-3 h-3" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <!-- Botão Adicionar Complemento -->
      <button
        v-else
        @click="mostrandoFormNovo = true"
        class="w-full mt-3 py-2 text-sm text-primary border border-dashed border-primary/50 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
      >
        <font-awesome-icon icon="plus" class="w-3 h-3" />
        <span>Adicionar Complemento</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GrupoComplemento, Complemento } from '@shared/types/complementos.types'

interface Props {
  grupo: GrupoComplemento
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'editar-grupo': [grupo: GrupoComplemento]
  'atualizar': []
}>()

const { atualizarGrupo: atualizarGrupoComposable, criarComplemento, atualizarComplemento: atualizarComplementoComposable, excluirComplemento } = useComplementos()

// Estados
const mostrandoFormNovo = ref(false)
const complementoEditando = ref<Complemento | null>(null)

// Formulário novo complemento
const formNovoComplemento = ref({
  nome: '',
  preco: 0,
  ativo: true
})
const precoNovoFormatado = ref('0,00')

// Formulário edição complemento
const formEditComplemento = ref({
  nome: '',
  preco: 0
})
const precoEditFormatado = ref('0,00')

// Computed para complementos ordenados
const complementosOrdenados = computed(() => {
  return [...(props.grupo.complementos || [])].sort((a, b) => a.ordem - b.ordem)
})

// Watch para formatar preço novo
watch(precoNovoFormatado, (novoValor) => {
  const apenasNumeros = novoValor.replace(/\D/g, '')
  if (apenasNumeros === '' || apenasNumeros === '0') {
    formNovoComplemento.value.preco = 0
    precoNovoFormatado.value = '0,00'
    return
  }
  const numeroDecimal = parseInt(apenasNumeros) / 100
  formNovoComplemento.value.preco = numeroDecimal
  const partes = numeroDecimal.toFixed(2).split('.')
  const parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  precoNovoFormatado.value = `${parteInteira},${partes[1]}`
})

// Watch para formatar preço edição
watch(precoEditFormatado, (novoValor) => {
  const apenasNumeros = novoValor.replace(/\D/g, '')
  if (apenasNumeros === '' || apenasNumeros === '0') {
    formEditComplemento.value.preco = 0
    precoEditFormatado.value = '0,00'
    return
  }
  const numeroDecimal = parseInt(apenasNumeros) / 100
  formEditComplemento.value.preco = numeroDecimal
  const partes = numeroDecimal.toFixed(2).split('.')
  const parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  precoEditFormatado.value = `${parteInteira},${partes[1]}`
})

// Atualizar configurações do grupo
const atualizarGrupo = async (dados: Partial<GrupoComplemento>) => {
  // Se marcar como obrigatório e min_opcoes for 0, ajustar para 1
  if (dados.obrigatorio === true && props.grupo.min_opcoes === 0) {
    dados.min_opcoes = 1
  }
  
  // Se desmarcar obrigatório e min_opcoes estiver > 0, não forçar mudança
  // (deixa o usuário decidir se quer manter ou não)
  
  await atualizarGrupoComposable(props.grupo.id, dados)
  emit('atualizar')
}

// Atualizar quantidade mínima com validação
const atualizarMinOpcoes = async (valor: string) => {
  let minOpcoes = parseInt(valor) || 0
  
  // Se for obrigatório, não permite 0
  if (props.grupo.obrigatorio && minOpcoes === 0) {
    minOpcoes = 1
  }
  
  await atualizarGrupo({ min_opcoes: minOpcoes })
}

// Adicionar novo complemento
const salvarNovoComplemento = async () => {
  if (!formNovoComplemento.value.nome.trim()) return

  await criarComplemento({
    grupo_id: props.grupo.id,
    nome: formNovoComplemento.value.nome.trim(),
    descricao: '',
    preco: formNovoComplemento.value.preco,
    ativo: formNovoComplemento.value.ativo,
    ordem: props.grupo.complementos?.length || 0
  })

  cancelarNovoComplemento()
  emit('atualizar')
}

const cancelarNovoComplemento = () => {
  mostrandoFormNovo.value = false
  formNovoComplemento.value = {
    nome: '',
    preco: 0,
    ativo: true
  }
  precoNovoFormatado.value = '0,00'
}

// Editar complemento
const iniciarEdicaoComplemento = (complemento: Complemento) => {
  complementoEditando.value = complemento
  formEditComplemento.value = {
    nome: complemento.nome,
    preco: complemento.preco
  }
  const partes = complemento.preco.toFixed(2).split('.')
  const parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  precoEditFormatado.value = `${parteInteira},${partes[1]}`
}

const salvarEdicaoComplemento = async () => {
  if (!complementoEditando.value || !formEditComplemento.value.nome.trim()) return

  await atualizarComplementoComposable(complementoEditando.value.id, {
    nome: formEditComplemento.value.nome.trim(),
    preco: formEditComplemento.value.preco
  })

  cancelarEdicaoComplemento()
  emit('atualizar')
}

const cancelarEdicaoComplemento = () => {
  complementoEditando.value = null
  formEditComplemento.value = {
    nome: '',
    preco: 0
  }
  precoEditFormatado.value = '0,00'
}

// Toggle status do complemento
const toggleStatusComplemento = async (complemento: Complemento) => {
  await atualizarComplementoComposable(complemento.id, {
    ativo: !complemento.ativo
  })
  emit('atualizar')
}

// Excluir complemento
const confirmarExcluirComplemento = async (complemento: Complemento) => {
  if (confirm(`Deseja realmente excluir "${complemento.nome}"?`)) {
    await excluirComplemento(complemento.id)
    emit('atualizar')
  }
}
</script>
