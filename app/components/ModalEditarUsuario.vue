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

// Estado do formulário
const form = ref({
  nome: '',
  papel: 'atendente' as PapelUsuario,
  permissoesPersonalizadas: false,
  permissoes: null as Permissoes | null
})

// Sincronizar com o usuário selecionado
watch(() => [props.isOpen, props.usuario], ([isOpen, usuario]) => {
  if (isOpen && usuario) {
    form.value = {
      nome: usuario.nome || '',
      papel: usuario.papel,
      permissoesPersonalizadas: false,
      permissoes: PERMISSOES_PADRAO[usuario.papel as PapelUsuario]
    }
  }
}, { immediate: true })

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

// Permissões ativas (padrão ou personalizadas)
const permissoesAtivas = computed(() => {
  if (form.value.permissoesPersonalizadas && form.value.permissoes) {
    return form.value.permissoes
  }
  return PERMISSOES_PADRAO[form.value.papel]
})

// Atualizar permissões ao mudar papel (se não estiver personalizado)
watch(() => form.value.papel, (novoPapel) => {
  if (!form.value.permissoesPersonalizadas) {
    form.value.permissoes = PERMISSOES_PADRAO[novoPapel]
  }
})

// Habilitar modo personalizado
const habilitarPersonalizacao = () => {
  form.value.permissoesPersonalizadas = true
  form.value.permissoes = { ...PERMISSOES_PADRAO[form.value.papel] }
}

// Resetar para padrão
const resetarParaPadrao = () => {
  form.value.permissoesPersonalizadas = false
  form.value.permissoes = PERMISSOES_PADRAO[form.value.papel]
}

const salvar = () => {
  console.log('Salvar alterações:', form.value)
  
  // Preparar dados para envio
  const dataToSave = {
    nome: form.value.nome,
    papel: form.value.papel,
    permissoes: form.value.permissoesPersonalizadas 
      ? form.value.permissoes 
      : PERMISSOES_PADRAO[form.value.papel],
    permissoesPersonalizadas: form.value.permissoesPersonalizadas
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

          <!-- Toggle de permissões personalizadas -->
          <div class="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p class="text-sm font-medium text-foreground">Permissões Personalizadas</p>
              <p class="text-xs text-muted-foreground mt-1">
                Personalize as permissões específicas deste usuário
              </p>
            </div>
            <button
              v-if="!form.permissoesPersonalizadas"
              @click="habilitarPersonalizacao"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Personalizar
            </button>
            <button
              v-else
              @click="resetarParaPadrao"
              class="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Resetar
            </button>
          </div>

          <!-- Visualização das permissões -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <font-awesome-icon icon="lock" class="text-xs" />
              Permissões {{ form.permissoesPersonalizadas ? 'Personalizadas' : `do ${PAPEL_LABELS[form.papel]}` }}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Pedidos -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Pedidos</p>
                <div class="space-y-1">
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.pedidos.criar"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.pedidos.criar ? 'check' : 'times'"
                      :class="permissoesAtivas.pedidos.criar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Criar</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.pedidos.editar"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.pedidos.editar ? 'check' : 'times'"
                      :class="permissoesAtivas.pedidos.editar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Editar</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.pedidos.excluir"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.pedidos.excluir ? 'check' : 'times'"
                      :class="permissoesAtivas.pedidos.excluir ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Excluir</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.pedidos.visualizar"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.pedidos.visualizar ? 'check' : 'times'"
                      :class="permissoesAtivas.pedidos.visualizar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Visualizar</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.pedidos.alterar_status"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.pedidos.alterar_status ? 'check' : 'times'"
                      :class="permissoesAtivas.pedidos.alterar_status ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Alterar Status</span>
                  </label>
                </div>
              </div>

              <!-- Cardápio -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Cardápio</p>
                <div class="space-y-1">
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.cardapio.criar_produto"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.cardapio.criar_produto ? 'check' : 'times'"
                      :class="permissoesAtivas.cardapio.criar_produto ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Criar Produto</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.cardapio.editar_produto"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.cardapio.editar_produto ? 'check' : 'times'"
                      :class="permissoesAtivas.cardapio.editar_produto ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Editar Produto</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.cardapio.excluir_produto"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.cardapio.excluir_produto ? 'check' : 'times'"
                      :class="permissoesAtivas.cardapio.excluir_produto ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Excluir Produto</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.cardapio.ativar_desativar"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.cardapio.ativar_desativar ? 'check' : 'times'"
                      :class="permissoesAtivas.cardapio.ativar_desativar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Ativar/Desativar</span>
                  </label>
                </div>
              </div>

              <!-- Relatórios -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Relatórios</p>
                <div class="space-y-1">
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.relatorios.visualizar"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.relatorios.visualizar ? 'check' : 'times'"
                      :class="permissoesAtivas.relatorios.visualizar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Visualizar</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.relatorios.exportar"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.relatorios.exportar ? 'check' : 'times'"
                      :class="permissoesAtivas.relatorios.exportar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Exportar</span>
                  </label>
                </div>
              </div>

              <!-- Financeiro -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Financeiro</p>
                <div class="space-y-1">
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.financeiro.visualizar_valores"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.financeiro.visualizar_valores ? 'check' : 'times'"
                      :class="permissoesAtivas.financeiro.visualizar_valores ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Ver Valores</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.financeiro.gerar_relatorios"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.financeiro.gerar_relatorios ? 'check' : 'times'"
                      :class="permissoesAtivas.financeiro.gerar_relatorios ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Gerar Relatórios</span>
                  </label>
                </div>
              </div>

              <!-- Configurações -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Configurações</p>
                <div class="space-y-1">
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.configuracoes.editar_empresa"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.configuracoes.editar_empresa ? 'check' : 'times'"
                      :class="permissoesAtivas.configuracoes.editar_empresa ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Editar Empresa</span>
                  </label>
                  <label class="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      v-if="form.permissoesPersonalizadas && form.permissoes"
                      v-model="form.permissoes.configuracoes.gerenciar_usuarios"
                      type="checkbox"
                      class="rounded border-border"
                    />
                    <font-awesome-icon
                      v-else
                      :icon="permissoesAtivas.configuracoes.gerenciar_usuarios ? 'check' : 'times'"
                      :class="permissoesAtivas.configuracoes.gerenciar_usuarios ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Gerenciar Usuários</span>
                  </label>
                </div>
              </div>
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
