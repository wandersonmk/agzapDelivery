<template>
  <div class="max-w-7xl mx-auto">
    <!-- Link do Cardápio Online -->
    <div class="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-lg p-6 mb-8">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-foreground">Link do Cardápio Online</h3>
              <p class="text-sm text-muted-foreground">Compartilhe este link com seus clientes</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 font-mono text-sm text-foreground">
              {{ linkCardapio }}
            </div>
            <button
              @click="copiarLink"
              :class="[
                'px-5 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                copiado 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
              ]"
            >
              <svg v-if="!copiado" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ copiado ? 'Copiado!' : 'Copiar Link' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards de métricas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Card Total de Itens -->
      <div class="relative bg-gradient-to-br from-card via-blue-950/10 to-card text-card-foreground rounded-lg border border-blue-800/20 shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Total de Itens</p>
            <p class="text-2xl font-bold text-foreground">{{ metrics.totalItens }}</p>
            <p class="text-xs text-green-600 mt-1">+3 novos esta semana</p>
          </div>
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <font-awesome-icon 
              icon="utensils" 
              class="w-6 h-6 text-white" 
            />
          </div>
        </div>
      </div>

      <!-- Card Categorias -->
      <div class="relative bg-gradient-to-br from-card via-emerald-950/10 to-card text-card-foreground rounded-lg border border-emerald-800/20 shadow-sm hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Categorias</p>
            <p class="text-2xl font-bold text-foreground">{{ metrics.categorias }}</p>
            <p class="text-xs text-green-600 mt-1">bem organizadas</p>
          </div>
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14-7H5c-.8 0-1.5.7-1.5 1.5v11c0 .8.7 1.5 1.5 1.5h14c.8 0 1.5-.7 1.5-1.5v-11c0-.8-.7-1.5-1.5-1.5z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Card Mais Vendidos -->
      <div class="relative bg-gradient-to-br from-card via-amber-950/10 to-card text-card-foreground rounded-lg border border-amber-800/20 shadow-sm hover:shadow-md hover:shadow-amber-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Mais Vendidos</p>
            <p class="text-2xl font-bold text-foreground">{{ metrics.maisVendidos }}</p>
            <p class="text-xs text-yellow-600 mt-1">itens populares</p>
          </div>
          <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Card Preço Médio -->
      <div class="relative bg-gradient-to-br from-card via-purple-950/10 to-card text-card-foreground rounded-lg border border-purple-800/20 shadow-sm hover:shadow-md hover:shadow-purple-500/10 transition-all duration-300 p-6 group overflow-hidden">
        <!-- Efeito de brilho sutil -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400 mb-1">Preço Médio</p>
            <p class="text-2xl font-bold text-foreground">R$ {{ metrics.precoMedio.toFixed(2) }}</p>
            <p class="text-xs text-green-600 mt-1">valor competitivo</p>
          </div>
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Itens do Cardápio -->
    <div class="bg-card border border-border rounded-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-foreground">Itens do Cardápio</h2>
        <button class="text-sm text-primary hover:text-primary/80 transition-colors">
          Ver todos
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoria</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Preço</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vendas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itensCardapio" :key="item.id" class="border-b border-border hover:bg-muted/50 transition-colors">
              <td class="py-3 px-4 text-sm text-foreground font-medium">{{ item.nome }}</td>
              <td class="py-3 px-4 text-sm text-muted-foreground">{{ item.categoria }}</td>
              <td class="py-3 px-4 text-sm font-medium text-foreground">R$ {{ item.preco.toFixed(2) }}</td>
              <td class="py-3 px-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(item.status)"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-muted-foreground">{{ item.vendas }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gerarSlugUnico } from '~/utils/slugUtils'

const supabase = useSupabaseClient()
const { user } = useAuth()
const toast = useToastSafe()

// Link do cardápio
const linkCardapio = ref('')
const copiado = ref(false)

// Buscar slug da empresa
onMounted(async () => {
  if (!user.value?.empresa_id) return

  const { data } = await supabase
    .from('empresas')
    .select('slug, nome')
    .eq('id', user.value.empresa_id)
    .single()

  if (data) {
    // Se não tiver slug, gerar um
    if (!data.slug) {
      const novoSlug = await gerarSlugUnico(data.nome, user.value.empresa_id)
      
      await supabase
        .from('empresas')
        .update({ slug: novoSlug })
        .eq('id', user.value.empresa_id)

      linkCardapio.value = `${window.location.origin}/cardapio/${novoSlug}`
    } else {
      linkCardapio.value = `${window.location.origin}/cardapio/${data.slug}`
    }
  }
})

// Copiar link
const copiarLink = async () => {
  try {
    await navigator.clipboard.writeText(linkCardapio.value)
    copiado.value = true
    toast?.success('Link copiado!')
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (error) {
    console.error('Erro ao copiar:', error)
    toast?.error('Erro ao copiar link')
  }
}

// Métricas do cardápio
const metrics = reactive({
  totalItens: 45,
  categorias: 8,
  maisVendidos: 12,
  precoMedio: 28.50
})

// Dados dos itens do cardápio
const itensCardapio = reactive([
  {
    id: 1,
    nome: 'Pizza Margherita',
    categoria: 'Pizzas',
    preco: 32.90,
    status: 'Disponível',
    vendas: 156
  },
  {
    id: 2,
    nome: 'Hambúrguer Artesanal',
    categoria: 'Lanches',
    preco: 24.50,
    status: 'Disponível',
    vendas: 89
  },
  {
    id: 3,
    nome: 'Risotto de Camarão',
    categoria: 'Pratos Principais',
    preco: 45.90,
    status: 'Esgotado',
    vendas: 34
  },
  {
    id: 4,
    nome: 'Suco Natural',
    categoria: 'Bebidas',
    preco: 8.90,
    status: 'Disponível',
    vendas: 203
  },
  {
    id: 5,
    nome: 'Tiramisù',
    categoria: 'Sobremesas',
    preco: 18.90,
    status: 'Disponível',
    vendas: 67
  }
])

// Função para retornar as classes CSS baseadas no status
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Disponível':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'Esgotado':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'Em Preparo':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}
</script>
