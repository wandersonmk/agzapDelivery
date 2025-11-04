<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

// Estados
const carregando = ref(false)
const erro = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const email = ref('')
const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)

// Extrair token da URL ao montar
onMounted(async () => {
  try {
    // Pegar o hash da URL
    const hash = window.location.hash
    
    if (!hash) {
      erro.value = 'Link de convite inválido ou expirado'
      return
    }

    // Extrair access_token e refresh_token do hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    console.log('[completar-cadastro] Tipo:', type)
    console.log('[completar-cadastro] Token presente:', !!accessToken)

    if (type !== 'invite' || !accessToken) {
      erro.value = 'Link de convite inválido'
      return
    }

    // Definir sessão com o token
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    })

    if (sessionError) {
      console.error('[completar-cadastro] Erro ao definir sessão:', sessionError)
      erro.value = 'Erro ao processar convite'
      return
    }

    // Obter dados do usuário
    const { data: userData } = await supabase.auth.getUser()
    
    if (userData?.user?.email) {
      email.value = userData.user.email
      console.log('[completar-cadastro] Email do usuário:', email.value)
    }

  } catch (error) {
    console.error('[completar-cadastro] Erro:', error)
    erro.value = 'Erro ao processar convite'
  }
})

// Validações
const senhaValida = computed(() => senha.value.length >= 6)
const senhasConferem = computed(() => senha.value === confirmarSenha.value && senha.value.length > 0)
const formularioValido = computed(() => senhaValida.value && senhasConferem.value)

// Completar cadastro
const completarCadastro = async () => {
  if (!formularioValido.value) return

  carregando.value = true
  erro.value = ''

  try {
    // Atualizar senha do usuário
    const { error: updateError } = await supabase.auth.updateUser({
      password: senha.value
    })

    if (updateError) {
      console.error('[completar-cadastro] Erro ao atualizar senha:', updateError)
      erro.value = 'Erro ao definir senha. Tente novamente.'
      return
    }

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      erro.value = 'Erro ao obter dados do usuário'
      return
    }

    console.log('[completar-cadastro] Usuário autenticado:', user.id)

    // Atualizar nome na tabela usuarios (caso não tenha)
    const { error: updateUsuarioError } = await supabase
      .from('usuarios')
      .update({ 
        nome: user.email?.split('@')[0] || 'Usuário',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateUsuarioError) {
      console.warn('[completar-cadastro] Erro ao atualizar usuário:', updateUsuarioError)
    }

    // Redirecionar para dashboard
    const { success } = useToastSafe()
    success('Cadastro completado com sucesso! Bem-vindo!')
    
    setTimeout(() => {
      router.push('/pedidos')
    }, 1000)

  } catch (error) {
    console.error('[completar-cadastro] Erro:', error)
    erro.value = 'Erro ao completar cadastro. Tente novamente.'
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
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-foreground mb-2">Complete seu Cadastro</h1>
          <p class="text-sm text-muted-foreground">
            Defina sua senha para acessar a plataforma
          </p>
        </div>

        <!-- Email (read-only) -->
        <div v-if="email" class="mb-6 p-3 bg-muted/50 rounded-lg">
          <p class="text-xs text-muted-foreground mb-1">Você está criando uma conta para:</p>
          <p class="text-sm font-medium text-foreground">{{ email }}</p>
        </div>

        <!-- Erro -->
        <div v-if="erro" class="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p class="text-sm text-destructive">{{ erro }}</p>
        </div>

        <!-- Formulário -->
        <form v-if="!erro" @submit.prevent="completarCadastro" class="space-y-4">
          <!-- Senha -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Nova Senha
            </label>
            <div class="relative">
              <input
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="Mínimo 6 caracteres"
                class="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                @click="mostrarSenha = !mostrarSenha"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg v-if="!mostrarSenha" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="senha && !senhaValida" class="mt-1 text-xs text-destructive">
              A senha deve ter no mínimo 6 caracteres
            </p>
            <p v-else-if="senha && senhaValida" class="mt-1 text-xs text-success">
              ✓ Senha válida
            </p>
          </div>

          <!-- Confirmar Senha -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              Confirmar Senha
            </label>
            <div class="relative">
              <input
                v-model="confirmarSenha"
                :type="mostrarConfirmarSenha ? 'text' : 'password'"
                placeholder="Digite a senha novamente"
                class="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                @click="mostrarConfirmarSenha = !mostrarConfirmarSenha"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg v-if="!mostrarConfirmarSenha" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="confirmarSenha && !senhasConferem" class="mt-1 text-xs text-destructive">
              As senhas não conferem
            </p>
            <p v-else-if="confirmarSenha && senhasConferem" class="mt-1 text-xs text-success">
              ✓ As senhas conferem
            </p>
          </div>

          <!-- Botão -->
          <button
            type="submit"
            :disabled="!formularioValido || carregando"
            class="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="carregando" class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            <span>{{ carregando ? 'Completando...' : 'Completar Cadastro' }}</span>
          </button>
        </form>

        <!-- Link para voltar -->
        <div v-if="erro" class="mt-6 text-center">
          <NuxtLink to="/login" class="text-sm text-primary hover:underline">
            Voltar para o login
          </NuxtLink>
        </div>
      </div>

      <!-- Rodapé -->
      <p class="text-center text-xs text-muted-foreground mt-6">
        Ao completar seu cadastro, você concorda com nossos Termos de Uso
      </p>
    </div>
  </div>
</template>
