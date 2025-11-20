<script setup lang="ts">
import { PAPEL_LABELS, PERMISSOES_PADRAO } from '@shared/types/usuarios-empresas.types'
import type { PapelUsuario, Permissoes } from '@shared/types/usuarios-empresas.types'

interface Props {
  isOpen: boolean
  usuario: any | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  salvar: [data: any]
}>()

// Estado do formulário com checkboxes de módulos
const form = ref({
  nome: '',
  papel: 'atendente' as PapelUsuario,
  modulos: {
    atendimento: false,
    pedidos: false,
    cardapio: false,
    relatorios: false,
    configuracoes: false
  }
})

// Sincronizar com o usuário selecionado
watch(() => [props.isOpen, props.usuario], ([isOpen, usuario]) => {
  if (isOpen && usuario) {
    // Detectar quais módulos estão ativos baseado nas permissões do papel
    const permissoesPadrao = PERMISSOES_PADRAO[usuario.papel as PapelUsuario]
    
    form.value = {
      nome: usuario.nome || '',
      papel: usuario.papel,
      modulos: {
        atendimento: permissoesPadrao.pedidos.visualizar && permissoesPadrao.pedidos.alterar_status && !permissoesPadrao.pedidos.criar,
        pedidos: temAlgumaPermissaoModulo(permissoesPadrao.pedidos) && permissoesPadrao.pedidos.criar,
        cardapio: temAlgumaPermissaoModulo(permissoesPadrao.cardapio),
        relatorios: temAlgumaPermissaoModulo(permissoesPadrao.relatorios),
        configuracoes: temAlgumaPermissaoModulo(permissoesPadrao.configuracoes)
      }
    }
  }
}, { immediate: true })

// Verifica se um módulo tem alguma permissão ativa
const temAlgumaPermissaoModulo = (modulo: any): boolean => {
  return Object.values(modulo).some(valor => valor === true)
}

// Lista de papéis disponíveis
const papeisDisponiveis = computed(() => {
  return Object.entries(PAPEL_LABELS).map(([key, label]) => ({
    value: key as PapelUsuario,
    label
  }))
})

// Descrição do papel selecionado
const descricaoPapel = computed(() => {
  const descricoes: Record<PapelUsuario, string> = {
    proprietario: 'Acesso total ao sistema, incluindo configurações e gestão de usuários',
    admin: 'Acesso total ao sistema, similar ao proprietário',
    gerente: 'Gestão operacional completa, sem poder excluir dados',
    atendente: 'Foco em atendimento: criar e gerenciar pedidos',
    cozinha: 'Apenas visualizar pedidos e alterar status (Novo → Pronto)',
    entregador: 'Apenas visualizar pedidos de entrega e concluir'
  }
  return descricoes[form.value.papel]
})

// Construir permissões baseado nos módulos selecionados
const permissoesFinais = computed((): Permissoes => {
  return {
    pedidos: form.value.modulos.pedidos ? {
      criar: true,
      editar: true,
      excluir: true,
      visualizar: true,
      alterar_status: true
    } : form.value.modulos.atendimento ? {
      criar: false,
      editar: false,
      excluir: false,
      visualizar: true,
      alterar_status: true
    } : {
      criar: false,
      editar: false,
      excluir: false,
      visualizar: false,
      alterar_status: false
    },
    cardapio: form.value.modulos.cardapio ? {
      criar_produto: true,
      editar_produto: true,
      excluir_produto: true,
      ativar_desativar: true
    } : {
      criar_produto: false,
      editar_produto: false,
      excluir_produto: false,
      ativar_desativar: false
    },
    relatorios: form.value.modulos.relatorios ? {
      visualizar: true,
      exportar: true
    } : {
      visualizar: false,
      exportar: false
    },
    configuracoes: form.value.modulos.configuracoes ? {
      editar_empresa: true,
      gerenciar_usuarios: true
    } : {
      editar_empresa: false,
      gerenciar_usuarios: false
    }
  }
})

// Atualizar módulos ao mudar papel
watch(() => form.value.papel, (novoPapel) => {
  const permissoesPadrao = PERMISSOES_PADRAO[novoPapel]
  form.value.modulos = {
    atendimento: permissoesPadrao.pedidos.visualizar && permissoesPadrao.pedidos.alterar_status && !permissoesPadrao.pedidos.criar,
    pedidos: temAlgumaPermissaoModulo(permissoesPadrao.pedidos) && permissoesPadrao.pedidos.criar,
    cardapio: temAlgumaPermissaoModulo(permissoesPadrao.cardapio),
    relatorios: temAlgumaPermissaoModulo(permissoesPadrao.relatorios),
    configuracoes: temAlgumaPermissaoModulo(permissoesPadrao.configuracoes)
  }
})

// Funções para garantir exclusividade entre Atendimento e Pedidos
const toggleAtendimento = () => {
  if (form.value.modulos.atendimento) {
    form.value.modulos.pedidos = false
  }
}

const togglePedidos = () => {
  if (form.value.modulos.pedidos) {
    form.value.modulos.atendimento = false
  }
}

const salvar = () => {
  console.log('Salvar alterações:', form.value)
  console.log('Permissões finais:', permissoesFinais.value)
  
  // Preparar dados para envio
  const dataToSave = {
    nome: form.value.nome,
    papel: form.value.papel,
    permissoes: permissoesFinais.value
  }
  
  emit('salvar', dataToSave)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && usuario"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 class="text-xl font-bold text-foreground">Editar Usuário</h2>
            <p class="text-sm text-muted-foreground mt-1">
              {{ usuario.nome }} ({{ usuario.email }})
            </p>
          </div>
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
            <label class="block text-sm font-medium text-foreground mb-2">
              Nome do Usuário
            </label>
            <input
              v-model="form.nome"
              type="text"
              placeholder="Nome completo"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Papel -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Papel do Usuário
            </label>
            <select
              v-model="form.papel"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option
                v-for="papel in papeisDisponiveis"
                :key="papel.value"
                :value="papel.value"
              >
                {{ papel.label }}
              </option>
            </select>
            <p class="text-xs text-muted-foreground mt-1">
              {{ descricaoPapel }}
            </p>
          </div>

          <!-- Seleção de Módulos -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <font-awesome-icon icon="lock" class="text-xs" />
              Módulos de Acesso
            </h3>
              <div class="space-y-3">
                <label class="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    v-model="form.modulos.atendimento"
                    type="checkbox"
                    class="mt-1 rounded border-border"
                    @change="toggleAtendimento"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground mb-1">👁️ Atendimento</p>
                    <p class="text-xs text-muted-foreground">Apenas visualizar pedidos e alterar status (sem criar, editar ou excluir)</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    v-model="form.modulos.pedidos"
                    type="checkbox"
                    class="mt-1 rounded border-border"
                    @change="togglePedidos"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground mb-1">📦 Pedidos Completo</p>
                    <p class="text-xs text-muted-foreground">Criar, editar, excluir, visualizar e alterar status de pedidos</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    v-model="form.modulos.cardapio"
                    type="checkbox"
                    class="mt-1 rounded border-border"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground mb-1">🍕 Cardápio</p>
                    <p class="text-xs text-muted-foreground">Criar, editar, excluir e ativar/desativar produtos</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    v-model="form.modulos.relatorios"
                    type="checkbox"
                    class="mt-1 rounded border-border"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground mb-1">📊 Relatórios</p>
                    <p class="text-xs text-muted-foreground">Visualizar e exportar relatórios</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                  <input
                    v-model="form.modulos.configuracoes"
                    type="checkbox"
                    class="mt-1 rounded border-border"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground mb-1">⚙️ Configurações</p>
                    <p class="text-xs text-muted-foreground">Editar empresa e gerenciar usuários</p>
                  </div>
                </label>
              </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <AppButton
            variant="outline"
            @click="$emit('close')"
          >
            Cancelar
          </AppButton>
          <AppButton @click="salvar">
            <font-awesome-icon icon="save" class="mr-2" />
            Salvar Alterações
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
