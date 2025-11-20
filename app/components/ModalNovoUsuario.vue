<script setup lang="ts">
import { PAPEL_LABELS, PERMISSOES_PADRAO } from '@shared/types/usuarios-empresas.types'
import type { PapelUsuario } from '@shared/types/usuarios-empresas.types'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  usuarioCriado: []
  conviteEnviado: [link: string]
}>()

// Composables
const { enviarConvite } = useUsuarios()
const toast = await useToastSafe()

// Estado do formulário
const form = ref({
  nome: '',
  email: '',
  papel: 'atendente' as PapelUsuario,
  permissoesPersonalizadas: false
})

const salvando = ref(false)
const erro = ref('')

// Resetar formulário ao abrir/fechar
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    form.value = {
      nome: '',
      email: '',
      papel: 'atendente',
      permissoesPersonalizadas: false
    }
    erro.value = ''
    salvando.value = false
  }
})

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

// Permissões do papel selecionado
const permissoesPapel = computed(() => {
  return PERMISSOES_PADRAO[form.value.papel]
})

const salvar = async () => {
  // Validação
  if (!form.value.nome || form.value.nome.trim().length < 3) {
    erro.value = 'Por favor, informe o nome completo (mínimo 3 caracteres)'
    return
  }
  
  if (!form.value.email || !form.value.email.includes('@')) {
    erro.value = 'Por favor, informe um email válido'
    return
  }

  erro.value = ''
  salvando.value = true

  try {
    console.log('[ModalNovoUsuario] Enviando convite com dados:', {
      nome: form.value.nome,
      email: form.value.email,
      papel: form.value.papel,
      permissoes: permissoesPapel.value
    })

    // Enviar convite com permissões configuradas
    const resultado = await enviarConvite({
      nome: form.value.nome,
      email: form.value.email,
      papel: form.value.papel,
      permissoes: permissoesPapel.value
    })

    if (resultado.success) {
      // Se retornou link, emite evento para copiar
      if (resultado.link) {
        emit('conviteEnviado', resultado.link)
      } else {
        // Fallback se não houver link (email enviado normalmente)
        if (toast) {
          toast.success(`Convite enviado para ${form.value.email}!`)
        }
        emit('usuarioCriado')
      }
      emit('close')
    } else {
      erro.value = resultado.message
      if (toast) {
        toast.error(resultado.message)
      }
    }
  } catch (error: any) {
    console.error('[ModalNovoUsuario] Erro ao enviar convite:', error)
    erro.value = error.message || 'Erro ao enviar convite'
    if (toast) {
      toast.error('Erro ao enviar convite')
    }
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 class="text-xl font-bold text-foreground">Adicionar Usuário</h2>
            <p class="text-sm text-muted-foreground mt-1">
              Envie um convite para um novo usuário da empresa
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
          <!-- Erro -->
          <div v-if="erro" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex gap-3">
              <font-awesome-icon icon="exclamation-circle" class="text-red-600 dark:text-red-400 mt-0.5" />
              <div class="text-sm text-red-900 dark:text-red-100">
                <p class="font-medium">Erro ao enviar convite</p>
                <p class="text-xs text-red-700 dark:text-red-300 mt-1">{{ erro }}</p>
              </div>
            </div>
          </div>

          <!-- Nome -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Nome Completo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.nome"
              type="text"
              placeholder="Ex: João Silva"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              :disabled="salvando"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              Nome que aparecerá no sistema
            </p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Email do Usuário <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="usuario@exemplo.com"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              :disabled="salvando"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              Um convite será enviado para este email
            </p>
          </div>

          <!-- Papel -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Papel do Usuário <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.papel"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              :disabled="salvando"
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

          <!-- Visualização das permissões -->
          <div class="bg-muted/50 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <font-awesome-icon icon="lock" class="text-xs" />
              Permissões do {{ PAPEL_LABELS[form.papel] }}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Pedidos -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Pedidos</p>
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.pedidos.criar ? 'check' : 'times'"
                      :class="permissoesPapel.pedidos.criar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Criar</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.pedidos.editar ? 'check' : 'times'"
                      :class="permissoesPapel.pedidos.editar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Editar</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.pedidos.visualizar ? 'check' : 'times'"
                      :class="permissoesPapel.pedidos.visualizar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Visualizar</span>
                  </div>
                </div>
              </div>

              <!-- Cardápio -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Cardápio</p>
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.cardapio.criar_produto ? 'check' : 'times'"
                      :class="permissoesPapel.cardapio.criar_produto ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Criar Produto</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.cardapio.editar_produto ? 'check' : 'times'"
                      :class="permissoesPapel.cardapio.editar_produto ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Editar Produto</span>
                  </div>
                </div>
              </div>

              <!-- Relatórios -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Relatórios</p>
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.relatorios.visualizar ? 'check' : 'times'"
                      :class="permissoesPapel.relatorios.visualizar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Visualizar</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.relatorios.exportar ? 'check' : 'times'"
                      :class="permissoesPapel.relatorios.exportar ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Exportar</span>
                  </div>
                </div>
              </div>

              <!-- Financeiro -->
              <div>
                <p class="text-xs font-medium text-foreground mb-2">Financeiro</p>
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.financeiro.visualizar_valores ? 'check' : 'times'"
                      :class="permissoesPapel.financeiro.visualizar_valores ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Ver Valores</span>
                  </div>
                  <div class="flex items-center gap-2 text-xs">
                    <font-awesome-icon
                      :icon="permissoesPapel.financeiro.gerar_relatorios ? 'check' : 'times'"
                      :class="permissoesPapel.financeiro.gerar_relatorios ? 'text-green-600' : 'text-red-600'"
                    />
                    <span class="text-muted-foreground">Gerar Relatórios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aviso -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex gap-3">
              <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div class="text-sm text-blue-900 dark:text-blue-100">
                <p class="font-medium mb-1">Como funciona o convite?</p>
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  Um email será enviado para o usuário com um link de cadastro. Após criar a conta, 
                  ele terá acesso à empresa com as permissões definidas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <AppButton
            variant="outline"
            @click="$emit('close')"
            :disabled="salvando"
          >
            Cancelar
          </AppButton>
          <AppButton 
            @click="salvar"
            :disabled="salvando || !form.nome || !form.email"
          >
            <font-awesome-icon 
              :icon="salvando ? 'spinner' : 'paper-plane'" 
              :class="{ 'animate-spin': salvando }"
              class="mr-2" 
            />
            {{ salvando ? 'Enviando...' : 'Enviar Convite' }}
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
