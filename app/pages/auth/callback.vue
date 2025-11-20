<script setup lang="ts">
definePageMeta({
  layout: 'auth'
  // Sem middleware - permite acesso direto
})

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  // Pegar o hash da URL (token vem no hash após o Supabase processar)
  const hash = window.location.hash
  
  if (hash) {
    const params = new URLSearchParams(hash.substring(1))
    const type = params.get('type')
    
    // Se é um convite, redirecionar para completar-cadastro
    if (type === 'invite') {
      console.log('[auth/callback] Redirecionando para completar-cadastro')
      router.replace(`/completar-cadastro${hash}`)
      return
    }
  }
  
  // Para outros casos, redireciona para login
  console.log('[auth/callback] Redirecionando para login')
  router.replace('/login')
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p class="text-muted-foreground">Processando convite...</p>
    </div>
  </div>
</template>
