<script setup lang="ts">
import { PAPEL_LABELS } from '@shared/types/usuarios-empresas.types'
import type { PapelUsuario } from '@shared/types/usuarios-empresas.types'

interface Props {
  usuario: {
    id: string
    nome: string
    email: string
    papel: PapelUsuario
    ativo: boolean
    isPendente?: boolean
    vinculadoEm: Date
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  editar: [usuario: any]
  'toggle-status': [usuario: any]
  excluir: [usuario: any]
  'copiar-link': [usuario: any]
}>()

// Menu de ações aberto
const menuAberto = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// Fechar menu ao clicar fora
const fecharMenu = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    menuAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', fecharMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', fecharMenu)
})

// Função para formatar data
const formatarData = (data: Date) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Obter label do papel
const papelLabel = computed(() => {
  return PAPEL_LABELS[props.usuario.papel] || props.usuario.papel
})

// Obter cor do badge do papel
const papelColor = computed(() => {
  const colors: Record<PapelUsuario, string> = {
    proprietario: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    gerente: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    atendente: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    cozinha: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    entregador: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  }
  return colors[props.usuario.papel] || 'bg-gray-100 text-gray-700'
})

// Obter ícone do papel
const papelIcon = computed(() => {
  const icons: Record<PapelUsuario, string> = {
    proprietario: 'crown',
    admin: 'user-shield',
    gerente: 'user-tie',
    atendente: 'headset',
    cozinha: 'utensils',
    entregador: 'motorcycle'
  }
  return icons[props.usuario.papel] || 'user'
})
</script>

<template>
  <div class="p-4 hover:bg-muted/50 transition-colors">
    <div class="flex items-center justify-between gap-4">
      <!-- Informações do usuário -->
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <!-- Avatar -->
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="text-lg font-semibold text-primary">
            {{ usuario.nome.charAt(0).toUpperCase() }}
          </span>
        </div>

        <!-- Detalhes -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-foreground truncate">
              {{ usuario.nome }}
            </h3>
            
            <!-- Badge de status -->
            <span
              v-if="usuario.isPendente"
              class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1"
            >
              <font-awesome-icon icon="clock" class="text-xs" />
              Convite Pendente
            </span>
            <span
              v-else
              :class="[
                'px-2 py-0.5 text-xs font-medium rounded-full',
                usuario.ativo
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              ]"
            >
              {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-muted-foreground">
            <span class="truncate">{{ usuario.email }}</span>
            <span class="hidden sm:inline">•</span>
            <span class="flex items-center gap-1.5">
              <font-awesome-icon :icon="papelIcon" class="text-xs" />
              <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', papelColor]">
                {{ papelLabel }}
              </span>
            </span>
            <span class="hidden sm:inline">•</span>
            <span class="text-xs">Desde {{ formatarData(usuario.vinculadoEm) }}</span>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Botão Copiar Link (apenas para pendentes) -->
        <button
          v-if="usuario.isPendente"
          @click="$emit('copiar-link', usuario)"
          class="px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          title="Copiar link de convite"
        >
          <font-awesome-icon icon="link" class="w-4 h-4" />
          Copiar Link
        </button>

        <!-- Botão Editar (apenas para usuários confirmados) -->
        <button
          v-if="!usuario.isPendente"
          @click="$emit('editar', usuario)"
          class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          title="Editar usuário"
        >
          <font-awesome-icon icon="edit" class="w-4 h-4" />
        </button>

        <!-- Menu de ações -->
        <div class="relative">
          <button
            @click="menuAberto = !menuAberto"
            class="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Mais opções"
          >
            <font-awesome-icon icon="ellipsis-vertical" class="w-4 h-4" />
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="menuAberto"
            ref="menuRef"
            class="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 py-1"
          >
            <button
              @click="$emit('toggle-status', usuario); menuAberto = false"
              class="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
            >
              <font-awesome-icon
                :icon="usuario.ativo ? 'ban' : 'check-circle'"
                class="w-4 h-4"
              />
              {{ usuario.ativo ? 'Desativar' : 'Ativar' }}
            </button>

            <button
              @click="$emit('excluir', usuario); menuAberto = false"
              class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <font-awesome-icon icon="trash" class="w-4 h-4" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
