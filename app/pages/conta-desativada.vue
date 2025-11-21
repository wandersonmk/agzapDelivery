<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: []  // Sem middleware de auth para permitir acesso
})

const { signOut } = useAuth()

const fazerLogout = async () => {
  await signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted">
    <div class="max-w-md w-full">
      <!-- Card -->
      <div class="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header com ícone -->
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
          <div class="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <ClientOnly>
              <font-awesome-icon icon="ban" class="text-5xl text-white" />
            </ClientOnly>
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">
            Conta Desativada
          </h1>
          <p class="text-red-100 text-sm">
            Seu acesso foi temporariamente suspenso
          </p>
        </div>

        <!-- Conteúdo -->
        <div class="px-6 py-8 space-y-6">
          <!-- Mensagem principal -->
          <div class="text-center space-y-3">
            <p class="text-foreground font-medium">
              Sua conta foi desativada pelo administrador da empresa.
            </p>
            <p class="text-sm text-muted-foreground">
              No momento, você não tem permissão para acessar o sistema.
            </p>
          </div>

          <!-- Instruções -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex gap-3">
              <div class="flex-shrink-0">
                <ClientOnly>
                  <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400 text-lg mt-0.5" />
                </ClientOnly>
              </div>
              <div class="text-sm text-blue-900 dark:text-blue-100">
                <p class="font-semibold mb-2">O que fazer?</p>
                <p class="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  Entre em contato com o administrador da sua empresa para solicitar a reativação da sua conta.
                </p>
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  Apenas o administrador pode reativar seu acesso ao sistema.
                </p>
              </div>
            </div>
          </div>

          <!-- Botão de logout -->
          <div class="pt-4">
            <button
              @click="fazerLogout"
              class="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-medium hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ClientOnly>
                <font-awesome-icon icon="sign-out-alt" />
              </ClientOnly>
              Sair da Conta
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-muted/30 px-6 py-4 text-center border-t border-border">
          <p class="text-xs text-muted-foreground">
            Se você acredita que isso é um erro, entre em contato com o suporte
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
