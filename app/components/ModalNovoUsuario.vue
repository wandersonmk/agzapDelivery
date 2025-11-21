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

// Estado do formulário
const form = ref({
  nome: '',
  email: '',
  senha: '',
  papel: 'atendente' as PapelUsuario,
  modulos: {
    atendimento: false,
    pedidos: true,
    cardapio: false,
    relatorios: false,
    configuracoes: false
  }
})

const salvando = ref(false)
const erro = ref('')

// Resetar formulário ao abrir/fechar
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    form.value = {
      nome: '',
      email: '',
      senha: '',
      papel: 'atendente',
      modulos: {
        atendimento: false,
        pedidos: true,
        cardapio: false,
        relatorios: false,
        configuracoes: false
      }
    }
    erro.value = ''
    salvando.value = false
  } else {
    // Ao abrir, atualizar módulos baseado no papel padrão
    atualizarModulosPorPapel(form.value.papel)
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

// Verifica se um módulo tem alguma permissão ativa
const temAlgumaPermissaoModulo = (modulo: any): boolean => {
  return Object.values(modulo).some(valor => valor === true)
}

// Atualizar módulos ao mudar papel
const atualizarModulosPorPapel = (papel: PapelUsuario) => {
  const permissoesPadrao = PERMISSOES_PADRAO[papel]
  form.value.modulos = {
    atendimento: permissoesPadrao.pedidos.visualizar && permissoesPadrao.pedidos.alterar_status && !permissoesPadrao.pedidos.criar,
    pedidos: temAlgumaPermissaoModulo(permissoesPadrao.pedidos) && permissoesPadrao.pedidos.criar,
    cardapio: temAlgumaPermissaoModulo(permissoesPadrao.cardapio),
    relatorios: temAlgumaPermissaoModulo(permissoesPadrao.relatorios),
    configuracoes: temAlgumaPermissaoModulo(permissoesPadrao.configuracoes)
  }
}

// Watch para atualizar módulos ao mudar papel
watch(() => form.value.papel, (novoPapel) => {
  atualizarModulosPorPapel(novoPapel)
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

// Construir permissões finais baseado nos módulos selecionados
const permissoesFinais = computed(() => {
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

  if (!form.value.senha || form.value.senha.length < 6) {
    erro.value = 'A senha deve ter no mínimo 6 caracteres'
    return
  }

  erro.value = ''
  salvando.value = true

  try {
    console.log('[ModalNovoUsuario] Criando usuário com dados:', {
      nome: form.value.nome,
      email: form.value.email,
      papel: form.value.papel,
      modulos: form.value.modulos,
      permissoes: permissoesFinais.value
    })

    // Buscar empresa_id do usuário logado
    const { getEmpresaId } = useEmpresa()
    const empresaId = await getEmpresaId()
    
    if (!empresaId) {
      erro.value = 'Não foi possível identificar a empresa'
      const toast = await useToastSafe()
      if (toast) {
        toast.error(erro.value)
      }
      return
    }

    console.log('[ModalNovoUsuario] Criando usuário para empresa:', empresaId)

    // Criar usuário direto (SEM fazer login dele)
    const response = await $fetch('/api/auth/create-user-direct', {
      method: 'POST',
      body: {
        nome: form.value.nome,
        email: form.value.email,
        senha: form.value.senha,
        papel: form.value.papel,
        permissoes: permissoesFinais.value,
        empresaId: empresaId
      }
    })

    if (response.success) {
      // Fechar modal
      emit('close')
      
      const toast = await useToastSafe()
      if (toast) {
        toast.success(`Usuário criado! Email: ${form.value.email} | Senha: ${form.value.senha}`)
      }
      
      emit('usuarioCriado')
    } else {
      erro.value = response.message || 'Erro ao criar usuário'
      const toast = await useToastSafe()
      if (toast) {
        toast.error(erro.value)
      }
    }
  } catch (error: any) {
    console.error('[ModalNovoUsuario] Erro ao criar usuário:', error)
    erro.value = error.message || error.data?.message || 'Erro ao criar usuário'
    const toast = await useToastSafe()
    if (toast) {
      toast.error(erro.value)
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
                <p class="font-medium">Erro ao criar usuário</p>
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
              Email para acesso ao sistema
            </p>
          </div>

          <!-- Senha Provisória -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Senha Provisória <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.senha"
              type="text"
              placeholder="Mínimo 6 caracteres"
              class="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              :disabled="salvando"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              O usuário poderá alterar após o primeiro login
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
                    :disabled="salvando"
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
                    :disabled="salvando"
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
                    :disabled="salvando"
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
                    :disabled="salvando"
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
                    :disabled="salvando"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground mb-1">⚙️ Configurações</p>
                    <p class="text-xs text-muted-foreground">Editar empresa e gerenciar usuários</p>
                  </div>
                </label>
              </div>
          </div>

          <!-- Aviso -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex gap-3">
              <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-900 dark:text-blue-100">
                <p class="font-semibold mb-2">Como funciona?</p>
                <div class="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
                  <p>
                    <strong>1. Escolha o papel:</strong> Define o nível de acesso base do usuário (Proprietário, Gerente, Atendente, etc).
                  </p>
                  <p>
                    <strong>2. Selecione os módulos:</strong> Marque quais funcionalidades esse usuário poderá acessar no sistema.
                  </p>
                  <p>
                    <strong>3. Envie os dados:</strong> Após criar, compartilhe o email e senha provisória com o usuário para que ele possa acessar o sistema.
                  </p>
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
            {{ salvando ? 'Criando...' : 'Criar Usuário' }}
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
