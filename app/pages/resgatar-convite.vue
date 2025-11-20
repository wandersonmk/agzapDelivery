<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const router = useRouter()
const supabase = useSupabaseClient()

const token = ref('')
const carregando = ref(false)
const erro = ref('')

const resgatar = async () => {
  if (!token.value || token.value.length < 20) {
    erro.value = 'Token inválido'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    // Extrair apenas o token (remove a URL se colarem completa)
    let tokenLimpo = token.value.trim()
    
    // Se colaram a URL completa, extrair o token
    if (tokenLimpo.includes('token=')) {
      const urlParams = new URLSearchParams(tokenLimpo.split('?')[1])
      tokenLimpo = urlParams.get('token') || ''
    }

    if (!tokenLimpo) {
      erro.value = 'Token não encontrado na URL'
      return
    }

    console.log('[resgatar-convite] Validando token...')

    // Fazer requisição para verificar o token
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    
    const response = await $fetch<any>(`${supabaseUrl}/auth/v1/verify`, {
      method: 'POST',
      params: {
        token: tokenLimpo,
        type: 'invite'
      }
    })

    console.log('[resgatar-convite] Resposta:', response)

    // Se tiver access_token, redirecionar para completar-cadastro
    if (response.access_token) {
      // Redirecionar com o token no hash
      window.location.href = `/completar-cadastro#access_token=${response.access_token}&type=invite&refresh_token=${response.refresh_token || ''}`
    } else {
      erro.value = 'Token inválido ou expirado'
    }

  } catch (error: any) {
    console.error('[resgatar-convite] Erro:', error)
    erro.value = error.data?.message || 'Erro ao validar token. Verifique se o link está correto.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-card rounded-lg shadow-xl border border-border p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <font-awesome-icon icon="ticket" class="text-3xl text-primary" />
          </div>
          <h1 class="text-2xl font-bold text-foreground mb-2">
            Resgatar Convite
          </h1>
          <p class="text-muted-foreground text-sm">
            Cole o link de convite que você recebeu
          </p>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="resgatar" class="space-y-6">
          <!-- Token -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Link ou Token de Convite
            </label>
            <textarea
              v-model="token"
              rows="4"
              placeholder="Cole aqui a URL completa do convite..."
              class="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              :disabled="carregando"
              required
            />
            <p class="text-xs text-muted-foreground mt-2">
              Cole a URL completa que você recebeu por WhatsApp/Email
            </p>
          </div>

          <!-- Erro -->
          <div
            v-if="erro"
            class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div class="flex gap-2">
              <font-awesome-icon icon="exclamation-circle" class="text-red-600 dark:text-red-400 mt-0.5" />
              <p class="text-sm text-red-900 dark:text-red-100">{{ erro }}</p>
            </div>
          </div>

          <!-- Botão -->
          <AppButton
            type="submit"
            class="w-full"
            :disabled="carregando || !token"
          >
            <font-awesome-icon
              v-if="carregando"
              icon="spinner"
              class="animate-spin mr-2"
            />
            <font-awesome-icon v-else icon="check" class="mr-2" />
            {{ carregando ? 'Validando...' : 'Resgatar Convite' }}
          </AppButton>
        </form>

        <!-- Voltar -->
        <div class="mt-6 text-center">
          <NuxtLink
            to="/login"
            class="text-sm text-primary hover:underline"
          >
            ← Voltar para Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
