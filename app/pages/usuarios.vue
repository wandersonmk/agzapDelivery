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

// Estado para modal de link de convite
const isModalLinkConviteOpen = ref(false)
const linkConvite = ref('')

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
      nome: vinculo.usuarios?.nome || 'Convite Pendente',
      email: vinculo.usuarios?.email || 'Email não disponível',
      foto: vinculo.usuarios?.foto,
      papel: vinculo.papel,
      ativo: vinculo.ativo,
      isPendente: vinculo.isPendente || false, // Flag de convite pendente
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
  
  // Mostrar modal com link
  linkConvite.value = link
  isModalLinkConviteOpen.value = true
}

const copiarLink = async () => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(linkConvite.value)
      if (toastSuccess.value) {
        toastSuccess.value('Link copiado! Compartilhe com o usuário.')
      }
    } catch (err) {
      console.error('Erro ao copiar link:', err)
      if (toastError.value) {
        toastError.value('Erro ao copiar. Copie manualmente.')
      }
    }
  }
}

const fecharModalLink = () => {
  isModalLinkConviteOpen.value = false
  linkConvite.value = ''
}

const copiarLinkConvite = async (usuario: any) => {
  try {
    // Gerar novo link de convite
    const response = await $fetch<{ link: string }>('/api/auth/generate-invite-link', {
      method: 'POST',
      body: {
        email: usuario.email
      }
    })

    if (response.link) {
      // Copiar para clipboard
      await navigator.clipboard.writeText(response.link)
      
      if (toastSuccess.value) {
        toastSuccess.value('Link de convite copiado! Compartilhe com o usuário.')
      }
    } else {
      throw new Error('Link não gerado')
    }
  } catch (error) {
    console.error('Erro ao copiar link:', error)
    if (toastError.value) {
      toastError.value('Erro ao gerar link de convite')
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
          @copiar-link="copiarLinkConvite"
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

    <!-- Modal de Link de Convite -->
    <Teleport to="body">
      <div
        v-if="isModalLinkConviteOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="fecharModalLink"
      >
        <div class="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-200">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <font-awesome-icon icon="check" class="text-green-600 text-lg" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-foreground">Convite Criado com Sucesso!</h2>
                <p class="text-sm text-muted-foreground">Compartilhe este link com o usuário</p>
              </div>
            </div>
            <button
              @click="fecharModalLink"
              class="w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <font-awesome-icon icon="times" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <!-- Instruções -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div class="flex gap-3">
                <font-awesome-icon icon="info-circle" class="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div class="text-sm text-blue-900 dark:text-blue-100">
                  <p class="font-medium mb-1">Como compartilhar?</p>
                  <p class="text-xs text-blue-700 dark:text-blue-300">
                    Copie o link abaixo e envie para o usuário via WhatsApp, Telegram, Email ou outra forma de comunicação. 
                    Ao acessar o link, ele poderá criar a senha e terá acesso imediato ao sistema.
                  </p>
                </div>
              </div>
            </div>

            <!-- Link -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">
                Link de Convite
              </label>
              <div class="flex gap-2">
                <input
                  type="text"
                  :value="linkConvite"
                  readonly
                  class="flex-1 px-4 py-3 border border-border rounded-lg bg-muted/50 text-foreground font-mono text-sm"
                  @click="($event.target as HTMLInputElement).select()"
                />
                <AppButton
                  @click="copiarLink"
                  class="px-6"
                >
                  <font-awesome-icon icon="copy" class="mr-2" />
                  Copiar
                </AppButton>
              </div>
              <p class="text-xs text-muted-foreground mt-2">
                <font-awesome-icon icon="clock" class="mr-1" />
                Este link é válido por 24 horas
              </p>
            </div>

            <!-- Ações rápidas -->
            <div class="border-t border-border pt-4">
              <p class="text-sm font-medium text-foreground mb-3">Compartilhar via:</p>
              <div class="flex gap-2">
                <a
                  :href="`https://wa.me/?text=${encodeURIComponent('Olá! Você foi convidado para acessar nosso sistema. Use este link para criar sua conta: ' + linkConvite)}`"
                  target="_blank"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-sm"
                >
                  <font-awesome-icon :icon="['fab', 'whatsapp']" />
                  WhatsApp
                </a>
                <a
                  :href="`https://t.me/share/url?url=${encodeURIComponent(linkConvite)}&text=${encodeURIComponent('Você foi convidado para acessar nosso sistema')}`"
                  target="_blank"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm"
                >
                  <font-awesome-icon :icon="['fab', 'telegram']" />
                  Telegram
                </a>
                <a
                  :href="`mailto:?subject=${encodeURIComponent('Convite - Sistema')}&body=${encodeURIComponent('Olá! Você foi convidado para acessar nosso sistema.\n\nUse este link para criar sua conta:\n' + linkConvite)}`"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors text-sm"
                >
                  <font-awesome-icon icon="envelope" />
                  Email
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end">
            <AppButton
              variant="outline"
              @click="fecharModalLink"
            >
              Fechar
            </AppButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
