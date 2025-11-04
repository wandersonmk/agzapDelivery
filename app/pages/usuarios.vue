<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permissions'],
  layout: 'dashboard'
})

// Estado para modal de novo usuário
const isModalNovoUsuarioOpen = ref(false)
const isModalEditarUsuarioOpen = ref(false)
const selectedUsuario = ref<any>(null)

// Dados mockados temporários para visualização
const usuarios = ref([
  {
    id: '1',
    nome: 'Wanderson',
    email: 'wandersoncnm@gmail.com',
    papel: 'proprietario',
    ativo: true,
    vinculadoEm: new Date('2025-11-04')
  },
  {
    id: '2',
    nome: 'Edjane',
    email: 'instrutormk@gmail.com',
    papel: 'atendente',
    ativo: true,
    vinculadoEm: new Date('2025-11-04')
  }
])

// Filtros e busca
const searchQuery = ref('')
const filtroStatus = ref<'todos' | 'ativos' | 'inativos'>('todos')
const filtroPapel = ref<string>('todos')

// Computed para usuários filtrados
const usuariosFiltrados = computed(() => {
  let filtered = usuarios.value

  // Filtro de busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.nome.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  // Filtro de status
  if (filtroStatus.value === 'ativos') {
    filtered = filtered.filter(u => u.ativo)
  } else if (filtroStatus.value === 'inativos') {
    filtered = filtered.filter(u => !u.ativo)
  }

  // Filtro de papel
  if (filtroPapel.value !== 'todos') {
    filtered = filtered.filter(u => u.papel === filtroPapel.value)
  }

  return filtered
})

// Funções de ação
const abrirModalNovo = () => {
  isModalNovoUsuarioOpen.value = true
}

const abrirModalEditar = (usuario: any) => {
  selectedUsuario.value = usuario
  isModalEditarUsuarioOpen.value = true
}

const fecharModais = () => {
  isModalNovoUsuarioOpen.value = false
  isModalEditarUsuarioOpen.value = false
  selectedUsuario.value = null
}

const toggleStatus = (usuario: any) => {
  console.log('Toggle status:', usuario)
  // Aqui virá a lógica de banco de dados
}

const excluirUsuario = (usuario: any) => {
  console.log('Excluir usuário:', usuario)
  // Aqui virá a lógica de banco de dados
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header com título e botão adicionar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Gerenciar Usuários</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Adicione e gerencie usuários da sua empresa
        </p>
      </div>
      
      <AppButton @click="abrirModalNovo" class="flex items-center gap-2">
        <font-awesome-icon icon="user-plus" />
        Adicionar Usuário
      </AppButton>
    </div>

    <!-- Card com filtros e lista -->
    <div class="bg-card border border-border rounded-lg shadow-sm">
      <!-- Filtros -->
      <div class="p-4 border-b border-border">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Campo de busca -->
          <div class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <font-awesome-icon icon="search" class="text-muted-foreground" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nome ou email..."
                class="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <!-- Filtro de papel -->
          <select
            v-model="filtroPapel"
            class="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="todos">Todos os papéis</option>
            <option value="proprietario">Proprietário</option>
            <option value="admin">Admin</option>
            <option value="gerente">Gerente</option>
            <option value="atendente">Atendente</option>
            <option value="cozinha">Cozinha</option>
            <option value="entregador">Entregador</option>
          </select>

          <!-- Filtro de status -->
          <select
            v-model="filtroStatus"
            class="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
      </div>

      <!-- Lista de usuários -->
      <div class="divide-y divide-border">
        <UsuarioListItem
          v-for="usuario in usuariosFiltrados"
          :key="usuario.id"
          :usuario="usuario"
          @editar="abrirModalEditar"
          @toggle-status="toggleStatus"
          @excluir="excluirUsuario"
        />

        <!-- Estado vazio -->
        <div v-if="usuariosFiltrados.length === 0" class="p-12 text-center">
          <div class="text-muted-foreground mb-2">
            <font-awesome-icon icon="users" class="text-4xl mb-4" />
          </div>
          <p class="text-foreground font-medium">Nenhum usuário encontrado</p>
          <p class="text-sm text-muted-foreground mt-1">
            Tente ajustar os filtros ou adicione um novo usuário
          </p>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <ModalNovoUsuario
      :isOpen="isModalNovoUsuarioOpen"
      @close="fecharModais"
    />

    <ModalEditarUsuario
      :isOpen="isModalEditarUsuarioOpen"
      :usuario="selectedUsuario"
      @close="fecharModais"
    />
  </div>
</template>
