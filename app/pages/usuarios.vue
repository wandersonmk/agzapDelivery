<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'permissions'],
  layout: 'dashboard'
})

// Estados de carregamento
const carregando = ref(false)
const usuarios = ref<any[]>([])

// Composables - usar refs para inicialização no onMounted
const buscarUsuariosEmpresa = ref<any>(null)
const toggleStatusUsuario = ref<any>(null)
const removerUsuario = ref<any>(null)
const toastSuccess = ref<any>(null)
const toastError = ref<any>(null)

// Estado para modal de novo usuário
const isModalNovoUsuarioOpen = ref(false)
const isModalEditarUsuarioOpen = ref(false)
const selectedUsuario = ref<any>(null)

// Buscar usuários ao montar o componente (apenas no cliente)
onMounted(async () => {
  // Inicializar composables no cliente
  const usuariosComposable = useUsuarios()
  buscarUsuariosEmpresa.value = usuariosComposable.buscarUsuariosEmpresa
  toggleStatusUsuario.value = usuariosComposable.toggleStatusUsuario
  removerUsuario.value = usuariosComposable.removerUsuario
  
  const toast = useToastSafe()
  toastSuccess.value = toast.success
  toastError.value = toast.error
  
  // Carregar usuários
  await carregarUsuarios()
})

// Função para carregar usuários
const carregarUsuarios = async () => {
  if (!buscarUsuariosEmpresa.value) return
  
  carregando.value = true
  try {
    const dados = await buscarUsuariosEmpresa.value()
    
    // Mapear dados para formato usado no componente
    usuarios.value = dados.map((vinculo: any) => ({
      id: vinculo.id, // ID do vínculo
      usuarioId: vinculo.usuarios?.id,
      nome: vinculo.usuarios?.nome || 'Usuário Pendente',
      email: vinculo.usuarios?.email || 'Email não disponível',
      foto: vinculo.usuarios?.foto,
      papel: vinculo.papel,
      ativo: vinculo.ativo,
      vinculadoEm: new Date(vinculo.created_at)
    }))
    
    console.log('[usuarios.vue] Usuários carregados:', usuarios.value)
  } catch (error) {
    console.error('[usuarios.vue] Erro ao carregar usuários:', error)
    if (toastError.value) {
      toastError.value('Erro ao carregar usuários')
    }
  } finally {
    carregando.value = false
  }
}

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

const onUsuarioCriado = async () => {
  // Recarregar lista de usuários
  await carregarUsuarios()
  if (toastSuccess.value) {
    toastSuccess.value('Usuário adicionado com sucesso!')
  }
}

const onConviteEnviado = async (link: string) => {
  // Recarregar lista de usuários
  await carregarUsuarios()
  
  // Copiar link automaticamente
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(link)
      if (toastSuccess.value) {
        toastSuccess.value('Link de convite copiado! Compartilhe com o usuário.')
      }
    } catch (err) {
      console.error('Erro ao copiar link:', err)
      if (toastSuccess.value) {
        toastSuccess.value('Convite enviado! Link: ' + link)
      }
    }
  } else {
    if (toastSuccess.value) {
      toastSuccess.value('Convite enviado! Link: ' + link)
    }
  }
}

const toggleStatus = async (usuario: any) => {
  if (!toggleStatusUsuario.value) return
  
  const novoStatus = !usuario.ativo
  const resultado = await toggleStatusUsuario.value(usuario.id, novoStatus)
  
  if (resultado.success) {
    await carregarUsuarios()
    if (toastSuccess.value) {
      toastSuccess.value(novoStatus ? 'Usuário ativado' : 'Usuário desativado')
    }
  } else {
    if (toastError.value) {
      toastError.value('Erro ao alterar status do usuário')
    }
  }
}

const excluirUsuario = async (usuario: any) => {
  if (!removerUsuario.value) return
  
  if (!confirm(`Tem certeza que deseja remover ${usuario.nome} da empresa?`)) {
    return
  }
  
  const resultado = await removerUsuario.value(usuario.id)
  
  if (resultado.success) {
    await carregarUsuarios()
    if (toastSuccess.value) {
      toastSuccess.value('Usuário removido com sucesso')
    }
  } else {
    if (toastError.value) {
      toastError.value('Erro ao remover usuário')
    }
  }
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
      <div v-if="carregando" class="p-12 text-center">
        <CircularProgress />
        <p class="text-muted-foreground mt-4">Carregando usuários...</p>
      </div>

      <div v-else class="divide-y divide-border">
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
      @usuario-criado="onUsuarioCriado"
      @convite-enviado="onConviteEnviado"
    />

    <ModalEditarUsuario
      :isOpen="isModalEditarUsuarioOpen"
      :usuario="selectedUsuario"
      @close="fecharModais"
    />
  </div>
</template>
