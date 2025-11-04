<script setup lang="ts">
import { PAPEL_LABELS } from '@shared/types/usuarios-empresas.types'

definePageMeta({
  middleware: ['auth'], // Apenas autenticação, não precisa de permissão específica
  layout: 'dashboard'
})

const { empresaAtual } = useEmpresa()
const router = useRouter()

const papelLabel = computed(() => {
  if (!empresaAtual.value) return ''
  return PAPEL_LABELS[empresaAtual.value.papel] || empresaAtual.value.papel
})

function voltarDashboard() {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="max-w-md w-full text-center">
      <!-- Ícone de bloqueio -->
      <div class="mb-6 flex justify-center">
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <font-awesome-icon 
            icon="lock" 
            class="text-4xl text-red-600 dark:text-red-400"
          />
        </div>
      </div>

      <!-- Título -->
      <h1 class="text-3xl font-bold text-foreground mb-3">
        Acesso Negado
      </h1>

      <!-- Mensagem -->
      <p class="text-muted-foreground mb-2">
        Você não tem permissão para acessar esta página.
      </p>

      <!-- Informações do papel atual -->
      <div v-if="empresaAtual" class="mb-6 p-4 bg-muted/50 rounded-lg">
        <p class="text-sm text-muted-foreground mb-1">
          Seu papel atual:
        </p>
        <p class="text-base font-semibold text-foreground">
          {{ papelLabel }}
        </p>
        <p class="text-xs text-muted-foreground mt-2">
          em <span class="font-medium">{{ empresaAtual.nome }}</span>
        </p>
      </div>

      <!-- Dica -->
      <div class="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p class="text-sm text-blue-900 dark:text-blue-200">
          💡 <strong>Dica:</strong> Entre em contato com o administrador da empresa para solicitar as permissões necessárias.
        </p>
      </div>

      <!-- Botão voltar -->
      <AppButton 
        @click="voltarDashboard"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon icon="home" class="mr-2" />
        Voltar ao Dashboard
      </AppButton>

      <!-- Link secundário -->
      <div class="mt-4">
        <button 
          @click="$router.back()"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para página anterior
        </button>
      </div>
    </div>
  </div>
</template>
