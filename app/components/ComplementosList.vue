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
const confirmarExcluirGrupo = async (grupo: GrupoComplemento) => {
  if (confirm(`Deseja realmente excluir o grupo "${grupo.nome}"? Todos os complementos deste grupo também serão excluídos.`)) {
    await excluirGrupo(grupo.id)
  }
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
              <input
                v-model.number="formComplemento.preco"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00 para gratuito"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
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
  </div>
</template>
