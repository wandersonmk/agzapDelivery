<script setup lang="ts">
import type { Produto } from '@shared/types/cardapio.types'
import type { GrupoComplemento } from '@shared/types/complementos.types'

interface Props {
  produto: Produto | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  salvar: [produto: Omit<Produto, 'id'>]
}>()

const { categorias } = useCardapio()
const { buscarGrupos, atualizarGruposDoProduto, buscarGruposDoProduto } = useComplementos()

// Estado
const gruposDisponiveis = ref<GrupoComplemento[]>([])
const gruposSelecionados = ref<string[]>([])

// Formulário
const form = ref({
  nome: '',
  preco: 0,
  descricao: '',
  foto: '',
  categoriaId: '',
  ativo: true,
  tipo: 'comum' as 'comum' | 'pizza',
  sabores: [] as any[],
  tamanhos: [
    { tamanho: 'P', preco: 0 },
    { tamanho: 'G', preco: 0 },
    { tamanho: 'F', preco: 0 }
  ] as any[]
})

// Carregar grupos ao montar
onMounted(async () => {
  gruposDisponiveis.value = await buscarGrupos()
  
  // Se está editando, carregar dados
  if (props.produto) {
    // Inicializar tamanhos se não existir ou estiver vazio
    let tamanhos = props.produto.tamanhos || []
    if (tamanhos.length === 0 && props.produto.tipo === 'pizza') {
      tamanhos = [
        { tamanho: 'P', preco: 0 },
        { tamanho: 'G', preco: 0 },
        { tamanho: 'F', preco: 0 }
      ]
    }
    
    form.value = {
      nome: props.produto.nome,
      preco: props.produto.preco,
      descricao: props.produto.descricao,
      foto: props.produto.foto || '',
      categoriaId: props.produto.categoriaId,
      ativo: props.produto.ativo,
      tipo: props.produto.tipo,
      sabores: props.produto.sabores || [],
      tamanhos
    }
    
    // Carregar grupos vinculados
    const grupos = await buscarGruposDoProduto(props.produto.id)
    gruposSelecionados.value = grupos.map(g => g.id)
  } else if (categorias.value.length > 0) {
    form.value.categoriaId = categorias.value[0].id
  }
})

// Computed
const titulo = computed(() => props.produto ? 'Editar Produto' : 'Novo Produto')

// Funções
const salvar = async () => {
  if (!form.value.nome || !form.value.categoriaId) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  // Validar preço para produtos comuns
  if (form.value.tipo === 'comum' && form.value.preco <= 0) {
    alert('Preencha o preço do produto')
    return
  }

  // Validar preços por tamanho para produtos tipo pizza
  if (form.value.tipo === 'pizza') {
    const precosValidos = form.value.tamanhos.every(t => t.preco > 0)
    if (!precosValidos) {
      alert('Preencha os preços para todos os tamanhos')
      return
    }
  }

  const produtoData: Omit<Produto, 'id'> = {
    nome: form.value.nome,
    preco: form.value.preco,
    descricao: form.value.descricao,
    foto: form.value.foto,
    categoriaId: form.value.categoriaId,
    ativo: form.value.ativo,
    tipo: form.value.tipo,
    ...(form.value.tipo === 'pizza' && {
      sabores: form.value.sabores,
      tamanhos: form.value.tamanhos
    })
  }

  emit('salvar', produtoData)
  
  // Se estiver editando, atualizar grupos
  if (props.produto) {
    await atualizarGruposDoProduto(props.produto.id, gruposSelecionados.value)
  }
}

const toggleGrupo = (grupoId: string) => {
  const index = gruposSelecionados.value.indexOf(grupoId)
  if (index > -1) {
    gruposSelecionados.value.splice(index, 1)
  } else {
    gruposSelecionados.value.push(grupoId)
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-xl font-bold text-foreground">{{ titulo }}</h2>
          <button
            @click="$emit('close')"
            class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <font-awesome-icon icon="times" class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nome do Produto *</label>
            <input
              v-model="form.nome"
              type="text"
              placeholder="Ex: X-Burger, Pizza Margherita"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          <!-- Categoria e Preço -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Categoria *</label>
              <select
                v-model="form.categoriaId"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="">Selecione...</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.nome }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Preço Base (R$) *</label>
              <input
                v-model.number="form.preco"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          <!-- Descrição -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Descrição</label>
            <textarea
              v-model="form.descricao"
              rows="3"
              placeholder="Descreva o produto..."
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          <!-- URL da Foto -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">URL da Foto</label>
            <input
              v-model="form.foto"
              type="url"
              placeholder="https://..."
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>

          <!-- Tipo de Produto -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Tipo de Produto *</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.tipo = 'comum'"
                :class="[
                  'px-4 py-3 border-2 rounded-lg transition-all text-left',
                  form.tipo === 'comum'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <font-awesome-icon icon="box" class="text-primary" />
                  <span class="font-semibold text-foreground">Produto comum</span>
                </div>
                <p class="text-xs text-muted-foreground">Produtos comuns têm preço único</p>
              </button>

              <button
                type="button"
                @click="form.tipo = 'pizza'"
                :class="[
                  'px-4 py-3 border-2 rounded-lg transition-all text-left',
                  form.tipo === 'pizza'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <font-awesome-icon icon="ruler" class="text-primary" />
                  <span class="font-semibold text-foreground">Por tamanho</span>
                </div>
                <p class="text-xs text-muted-foreground">Produtos com preços por tamanho (P, G, F)</p>
              </button>
            </div>
          </div>

          <!-- Preços por Tamanho (aparece quando tipo = pizza) -->
          <div v-if="form.tipo === 'pizza'" class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <font-awesome-icon icon="pizza-slice" class="text-orange-600" />
              Preços por Tamanho
            </h4>
            <p class="text-xs text-muted-foreground mb-4">
              Configure o preço para cada tamanho disponível. O "Preço Base" acima não será usado.
            </p>
            
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-foreground mb-1">
                  Pequena (P) - 4 fatias
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <input
                    v-model.number="form.tamanhos[0].preco"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1">
                  Grande (G) - 8 fatias
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <input
                    v-model.number="form.tamanhos[1].preco"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-foreground mb-1">
                  Família (F) - 8 fatias
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <input
                    v-model.number="form.tamanhos[2].preco"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Grupos de Complementos -->
          <div v-if="gruposDisponiveis.length > 0" class="bg-muted/30 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <font-awesome-icon icon="plus" class="text-xs" />
              Complementos e Adicionais
            </h3>
            <p class="text-xs text-muted-foreground mb-3">
              Selecione quais grupos de complementos estarão disponíveis para este produto
            </p>

            <div v-if="gruposDisponiveis.length === 0" class="text-center py-4 text-muted-foreground text-sm">
              Nenhum grupo de complementos criado ainda.
              <br>Acesse a aba "Complementos e Adicionais" para criar grupos.
            </div>

            <div v-else class="space-y-2">
              <label
                v-for="grupo in gruposDisponiveis"
                :key="grupo.id"
                class="flex items-start gap-3 p-3 bg-background rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="gruposSelecionados.includes(grupo.id)"
                  @change="toggleGrupo(grupo.id)"
                  class="mt-1 rounded border-border"
                />
                <div class="flex-1">
                  <p class="font-medium text-sm text-foreground">{{ grupo.nome }}</p>
                  <p v-if="grupo.descricao" class="text-xs text-muted-foreground mt-0.5">
                    {{ grupo.descricao }}
                  </p>
                  <div class="flex items-center gap-2 mt-1 text-xs">
                    <span v-if="grupo.obrigatorio" class="px-2 py-0.5 bg-red-500/20 text-red-700 dark:text-red-300 rounded">
                      Obrigatório
                    </span>
                    <span v-if="grupo.min_opcoes > 0" class="text-muted-foreground">
                      Mín: {{ grupo.min_opcoes }}
                    </span>
                    <span v-if="grupo.max_opcoes" class="text-muted-foreground">
                      Máx: {{ grupo.max_opcoes }}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Status -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.ativo" type="checkbox" class="rounded border-border" />
            <span class="text-sm text-foreground">Produto ativo (visível no cardápio)</span>
          </label>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <AppButton variant="outline" @click="$emit('close')">
            Cancelar
          </AppButton>
          <AppButton @click="salvar">
            <font-awesome-icon icon="save" class="mr-2" />
            Salvar Produto
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
