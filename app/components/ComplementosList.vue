<script setup lang="ts">
import type { GrupoComplemento, Complemento } from '@shared/types/complementos.types'

const { 
  buscarGrupos,
  buscarGrupoPorId,
  criarGrupo,
  atualizarGrupo,
  excluirGrupo,
  criarComplemento,
  atualizarComplemento,
  excluirComplemento,
  loading,
  grupos
} = useComplementos()

// Estado local
const grupoSelecionado = ref<GrupoComplemento | null>(null)
const mostrarModalGrupo = ref(false)
const mostrarModalComplemento = ref(false)
const complementoEditando = ref<Complemento | null>(null)
const modalConfirmacaoExclusao = ref(false)
const grupoParaExcluir = ref<GrupoComplemento | null>(null)

// Formulário de grupo
const formGrupo = ref({
  nome: '',
  descricao: '',
  obrigatorio: false,
  min_opcoes: 0,
  max_opcoes: null as number | null,
  ativo: true
})

// Formulário de complemento
const formComplemento = ref({
  grupo_id: '',
  nome: '',
  descricao: '',
  preco: 0,
  ativo: true,
  ordem: 0
})

// Estado para o preço formatado
const precoComplementoFormatado = ref('')

// Watch para formatar o preço enquanto digita
watch(precoComplementoFormatado, (novoValor) => {
  // Remove tudo exceto números
  const apenasNumeros = novoValor.replace(/\D/g, '')
  
  if (apenasNumeros === '' || apenasNumeros === '0') {
    formComplemento.value.preco = 0
    precoComplementoFormatado.value = '0,00'
    return
  }
  
  // Converte para número decimal
  const numeroDecimal = parseInt(apenasNumeros) / 100
  formComplemento.value.preco = numeroDecimal
  
  // Formata para exibição
  const partes = numeroDecimal.toFixed(2).split('.')
  const parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  precoComplementoFormatado.value = `${parteInteira},${partes[1]}`
})

// Watch para atualizar o campo formatado quando o preço mudar externamente
watch(() => formComplemento.value.preco, (novoPreco) => {
  if (novoPreco === 0) {
    precoComplementoFormatado.value = '0,00'
  } else {
    const partes = novoPreco.toFixed(2).split('.')
    const parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    precoComplementoFormatado.value = `${parteInteira},${partes[1]}`
  }
})

// Watch para ajustar min_opcoes quando obrigatorio mudar
watch(() => formGrupo.value.obrigatorio, (novoValor) => {
  if (novoValor && formGrupo.value.min_opcoes === 0) {
    formGrupo.value.min_opcoes = 1
  }
})

// Carregar grupos ao montar
onMounted(() => {
  buscarGrupos()
})

// Abrir modal para criar novo grupo
const novoGrupo = () => {
  formGrupo.value = {
    nome: '',
    descricao: '',
    obrigatorio: false,
    min_opcoes: 0,
    max_opcoes: null,
    ativo: true
  }
  mostrarModalGrupo.value = true
}

// Editar grupo existente
const editarGrupo = (grupo: GrupoComplemento) => {
  formGrupo.value = {
    nome: grupo.nome,
    descricao: grupo.descricao || '',
    obrigatorio: grupo.obrigatorio,
    min_opcoes: grupo.min_opcoes,
    max_opcoes: grupo.max_opcoes,
    ativo: grupo.ativo
  }
  grupoSelecionado.value = grupo
  mostrarModalGrupo.value = true
}

// Salvar grupo (criar ou atualizar)
const salvarGrupo = async () => {
  if (!formGrupo.value.nome) return

  if (grupoSelecionado.value) {
    await atualizarGrupo(grupoSelecionado.value.id, formGrupo.value)
  } else {
    await criarGrupo(formGrupo.value)
  }

  mostrarModalGrupo.value = false
  grupoSelecionado.value = null
}

// Excluir grupo
const confirmarExcluirGrupo = (grupo: GrupoComplemento) => {
  grupoParaExcluir.value = grupo
  modalConfirmacaoExclusao.value = true
}

const executarExclusaoGrupo = async () => {
  if (!grupoParaExcluir.value) return
  
  const grupoId = grupoParaExcluir.value.id
  
  await excluirGrupo(grupoId)
  
  // Se era o grupo selecionado, limpar seleção
  if (grupoSelecionado.value?.id === grupoId) {
    grupoSelecionado.value = null
  }
  
  modalConfirmacaoExclusao.value = false
  grupoParaExcluir.value = null
}

const cancelarExclusao = () => {
  modalConfirmacaoExclusao.value = false
  grupoParaExcluir.value = null
}

// Selecionar grupo para ver complementos
const selecionarGrupo = async (grupo: GrupoComplemento) => {
  const grupoCompleto = await buscarGrupoPorId(grupo.id)
  if (grupoCompleto) {
    grupoSelecionado.value = grupoCompleto
  }
}

// Novo complemento
const novoComplemento = () => {
  if (!grupoSelecionado.value) return

  formComplemento.value = {
    grupo_id: grupoSelecionado.value.id,
    nome: '',
    descricao: '',
    preco: 0,
    ativo: true,
    ordem: grupoSelecionado.value.complementos?.length || 0
  }
  precoComplementoFormatado.value = '0,00'
  complementoEditando.value = null
  mostrarModalComplemento.value = true
}

// Editar complemento
const editarComplemento = (complemento: Complemento) => {
  formComplemento.value = {
    grupo_id: complemento.grupo_id,
    nome: complemento.nome,
    descricao: complemento.descricao || '',
    preco: complemento.preco,
    ativo: complemento.ativo,
    ordem: complemento.ordem
  }
  // Formatar preço para exibição
  const partes = complemento.preco.toFixed(2).split('.')
  const parteInteira = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  precoComplementoFormatado.value = `${parteInteira},${partes[1]}`
  
  complementoEditando.value = complemento
  mostrarModalComplemento.value = true
}

// Salvar complemento
const salvarComplemento = async () => {
  if (!formComplemento.value.nome || !formComplemento.value.grupo_id) return

  if (complementoEditando.value) {
    await atualizarComplemento(complementoEditando.value.id, formComplemento.value)
  } else {
    await criarComplemento(formComplemento.value)
  }

  // Recarregar grupo
  if (grupoSelecionado.value) {
    const grupoAtualizado = await buscarGrupoPorId(grupoSelecionado.value.id)
    if (grupoAtualizado) {
      grupoSelecionado.value = grupoAtualizado
    }
  }

  mostrarModalComplemento.value = false
  complementoEditando.value = null
}

// Excluir complemento
const confirmarExcluirComplemento = async (complemento: Complemento) => {
  if (confirm(`Deseja realmente excluir "${complemento.nome}"?`)) {
    await excluirComplemento(complemento.id)
    
    // Recarregar grupo
    if (grupoSelecionado.value) {
      const grupoAtualizado = await buscarGrupoPorId(grupoSelecionado.value.id)
      if (grupoAtualizado) {
        grupoSelecionado.value = grupoAtualizado
      }
    }
  }
}

// Formatar preço
const formatarPreco = (preco: number) => {
  return preco > 0 ? `+R$ ${preco.toFixed(2)}` : 'Grátis'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-foreground">Complementos e Adicionais</h2>
        <p class="text-sm text-muted-foreground mt-1">
          Gerencie grupos de complementos para seus produtos (estilo iFood)
        </p>
      </div>
      <AppButton @click="novoGrupo">
        <font-awesome-icon icon="plus" class="mr-2" />
        Novo Grupo
      </AppButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <font-awesome-icon icon="spinner" spin class="text-4xl text-primary" />
    </div>

    <!-- Lista de Grupos -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Coluna de Grupos -->
      <div class="lg:col-span-1 space-y-3">
        <div class="bg-card border border-border rounded-lg p-4">
          <h3 class="font-semibold mb-3 text-foreground">Grupos</h3>
          
          <div v-if="grupos.length === 0" class="text-center py-8 text-muted-foreground">
            <font-awesome-icon icon="box-open" class="text-4xl mb-2" />
            <p>Nenhum grupo criado</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="grupo in grupos"
              :key="grupo.id"
              @click="selecionarGrupo(grupo)"
              :class="[
                'p-3 rounded-lg border cursor-pointer transition-colors',
                grupoSelecionado?.id === grupo.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted/30 border-border hover:border-primary/50'
              ]"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-sm text-foreground">{{ grupo.nome }}</p>
                  <p v-if="grupo.descricao" class="text-xs text-muted-foreground mt-1">
                    {{ grupo.descricao }}
                  </p>
                  <div class="flex items-center gap-2 mt-2 text-xs">
                    <span v-if="grupo.obrigatorio" class="px-2 py-0.5 bg-red-500/20 text-red-700 dark:text-red-300 rounded">
                      Obrigatório
                    </span>
                    <span v-if="!grupo.ativo" class="px-2 py-0.5 bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded">
                      Inativo
                    </span>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button
                    @click.stop="editarGrupo(grupo)"
                    class="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    <font-awesome-icon icon="edit" class="text-xs" />
                  </button>
                  <button
                    @click.stop="confirmarExcluirGrupo(grupo)"
                    class="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <font-awesome-icon icon="trash" class="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna de Complementos do Grupo Selecionado -->
      <div class="lg:col-span-2">
        <div v-if="!grupoSelecionado" class="bg-card border border-border rounded-lg p-12 text-center">
          <font-awesome-icon icon="chevron-left" class="text-4xl text-muted-foreground mb-4" />
          <p class="text-muted-foreground">
            Selecione um grupo para ver e gerenciar seus complementos
          </p>
        </div>

        <div v-else class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-foreground">{{ grupoSelecionado.nome }}</h3>
              <p v-if="grupoSelecionado.descricao" class="text-sm text-muted-foreground mt-1">
                {{ grupoSelecionado.descricao }}
              </p>
              <div class="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span v-if="grupoSelecionado.min_opcoes > 0">
                  Mínimo: {{ grupoSelecionado.min_opcoes }}
                </span>
                <span v-if="grupoSelecionado.max_opcoes">
                  Máximo: {{ grupoSelecionado.max_opcoes }}
                </span>
                <span v-if="!grupoSelecionado.max_opcoes && grupoSelecionado.min_opcoes === 0">
                  Ilimitado
                </span>
              </div>
            </div>
            <AppButton @click="novoComplemento" size="sm">
              <font-awesome-icon icon="plus" class="mr-2" />
              Adicionar Item
            </AppButton>
          </div>

          <!-- Lista de complementos -->
          <div v-if="!grupoSelecionado.complementos || grupoSelecionado.complementos.length === 0" 
               class="text-center py-8 text-muted-foreground">
            <p>Nenhum complemento neste grupo</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="complemento in grupoSelecionado.complementos"
              :key="complemento.id"
              class="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <p class="font-medium text-foreground">{{ complemento.nome }}</p>
                  <span class="text-sm font-semibold text-primary">
                    {{ formatarPreco(complemento.preco) }}
                  </span>
                  <span v-if="!complemento.ativo" class="px-2 py-0.5 bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded text-xs">
                    Inativo
                  </span>
                </div>
                <p v-if="complemento.descricao" class="text-sm text-muted-foreground mt-1">
                  {{ complemento.descricao }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editarComplemento(complemento)"
                  class="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  <font-awesome-icon icon="edit" />
                </button>
                <button
                  @click="confirmarExcluirComplemento(complemento)"
                  class="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                >
                  <font-awesome-icon icon="trash" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Grupo -->
    <Teleport to="body">
      <div
        v-if="mostrarModalGrupo"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="mostrarModalGrupo = false"
      >
        <div class="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-lg font-semibold text-foreground">
              {{ grupoSelecionado ? 'Editar Grupo' : 'Novo Grupo' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Nome do Grupo *</label>
              <input
                v-model="formGrupo.nome"
                type="text"
                placeholder="Ex: Adicionais, Molhos, Ponto da Carne"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Descrição</label>
              <textarea
                v-model="formGrupo.descricao"
                rows="2"
                placeholder="Descrição opcional"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Mínimo de Opções</label>
                <input
                  v-model.number="formGrupo.min_opcoes"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Máximo de Opções</label>
                <input
                  v-model.number="formGrupo.max_opcoes"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="formGrupo.obrigatorio" type="checkbox" class="rounded border-border" />
                <span class="text-sm text-foreground">Obrigatório (cliente precisa escolher)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="formGrupo.ativo" type="checkbox" class="rounded border-border" />
                <span class="text-sm text-foreground">Ativo</span>
              </label>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
            <AppButton variant="outline" @click="mostrarModalGrupo = false">Cancelar</AppButton>
            <AppButton @click="salvarGrupo">Salvar</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Complemento -->
    <Teleport to="body">
      <div
        v-if="mostrarModalComplemento"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="mostrarModalComplemento = false"
      >
        <div class="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-lg font-semibold text-foreground">
              {{ complementoEditando ? 'Editar Complemento' : 'Novo Complemento' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Nome *</label>
              <input
                v-model="formComplemento.nome"
                type="text"
                placeholder="Ex: Bacon, Cheddar, Ketchup"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Descrição</label>
              <input
                v-model="formComplemento.descricao"
                type="text"
                placeholder="Descrição opcional"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Preço Adicional (R$)</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                <input
                  v-model="precoComplementoFormatado"
                  type="text"
                  placeholder="0,00"
                  class="w-full pl-12 pr-4 py-2 border border-border rounded-lg bg-background text-foreground font-medium"
                  @focus="$event.target.select()"
                />
              </div>
              <p class="text-xs text-muted-foreground mt-1">Digite 0,00 para item gratuito</p>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="formComplemento.ativo" type="checkbox" class="rounded border-border" />
              <span class="text-sm text-foreground">Ativo</span>
            </label>
          </div>

          <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
            <AppButton variant="outline" @click="mostrarModalComplemento = false">Cancelar</AppButton>
            <AppButton @click="salvarComplemento">Salvar</AppButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Confirmação de Exclusão -->
    <Teleport to="body">
      <div
        v-if="modalConfirmacaoExclusao"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
        @click.self="cancelarExclusao"
      >
        <div class="bg-background rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">Confirmar Exclusão</h3>
                <p class="text-sm text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4">
            <p class="text-foreground">
              Tem certeza que deseja excluir o grupo <strong class="text-red-600 dark:text-red-400">"{{ grupoParaExcluir?.nome }}"</strong>?
            </p>

            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div class="flex gap-3">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">
                    Consequências da exclusão:
                  </p>
                  <ul class="text-xs text-amber-700 dark:text-amber-500 space-y-1">
                    <li>• Todos os complementos deste grupo serão excluídos</li>
                    <li>• Produtos vinculados perderão este grupo de complementos</li>
                    <li>• Histórico de pedidos anteriores não será afetado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
            <AppButton 
              variant="outline" 
              @click="cancelarExclusao"
            >
              Cancelar
            </AppButton>
            <AppButton 
              @click="executarExclusaoGrupo"
              class="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir Grupo
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
