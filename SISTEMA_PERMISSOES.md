# Sistema de Permissões - Guia de Implementação

## Problema Identificado

O atendente consegue excluir pedidos mesmo sem ter permissão para isso. Isso acontece porque:
1. As permissões só estão sendo verificadas no **frontend** (escondendo botões)
2. As **ações no banco de dados** não verificam permissões
3. Qualquer usuário pode chamar as funções diretamente via console do navegador

## Solução Implementada

### 1. Composable de Permissões (`usePermissoes.ts`)

Criado um composable centralizado para verificar permissões:

```typescript
const { podeExcluirPedido } = usePermissoes()

// Antes de executar ação
if (await podeExcluirPedido()) {
  // Executar exclusão
} else {
  // Mostrar erro "Sem permissão"
}
```

### 2. Funções Disponíveis

**Pedidos:**
- `podeVerPedidos()` - Visualizar lista de pedidos
- `podeCriarPedido()` - Criar novos pedidos
- `podeEditarPedido()` - Editar pedidos existentes
- `podeExcluirPedido()` - Excluir pedidos
- `podeAlterarStatusPedido()` - Alterar status (novo → cozinha → entrega → concluído)

**Cardápio:**
- `podeCriarProduto()` - Criar produtos
- `podeEditarProduto()` - Editar produtos
- `podeExcluirProduto()` - Excluir produtos
- `podeAtivarDesativarProduto()` - Ativar/desativar produtos

**Relatórios:**
- `podeVisualizarRelatorios()` - Ver relatórios
- `podeExportarRelatorios()` - Exportar PDF/Excel

**Configurações:**
- `podeEditarEmpresa()` - Editar dados da empresa
- `podeGerenciarUsuarios()` - Gerenciar usuários da empresa

### 3. Como Implementar nas Páginas

#### 3.1. Esconder botões no template (frontend)

```vue
<template>
  <button 
    v-if="permissoesSync?.pedidos.excluir" 
    @click="excluirPedido(pedido.id)"
  >
    Excluir
  </button>
</template>

<script setup>
const { permissoesSync } = usePermissoes()
</script>
```

#### 3.2. Verificar antes de executar ação (frontend)

```typescript
const excluirPedido = async (pedidoId: string) => {
  const { podeExcluirPedido } = usePermissoes()
  
  if (!await podeExcluirPedido()) {
    toast.error('Você não tem permissão para excluir pedidos')
    return
  }
  
  // Executar exclusão...
}
```

## Próximos Passos (Para Segurança Total)

### 1. Middleware de Verificação de Permissões (Backend)

Criar middleware no servidor para verificar permissões antes de executar qualquer ação no banco:

```typescript
// server/middleware/permissions.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user
  const permissoes = await getPermissoesUsuario(user.id)
  
  event.context.permissoes = permissoes
})
```

### 2. Row Level Security (RLS) no Supabase

Configurar políticas de segurança diretamente no banco de dados:

```sql
-- Exemplo: Apenas usuários com permissão podem deletar pedidos
CREATE POLICY "Users can delete pedidos if they have permission"
ON pedidos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_empresas ue
    WHERE ue.usuario_id = auth.uid()
    AND ue.empresa_id = pedidos.empresa_id
    AND (ue.permissoes->'pedidos'->>'excluir')::boolean = true
  )
);
```

### 3. Endpoints de API Protegidos

Criar endpoints que verifiquem permissões no servidor:

```typescript
// server/api/pedidos/[id].delete.ts
export default defineEventHandler(async (event) => {
  const user = event.context.user
  const pedidoId = event.context.params.id
  
  // Buscar permissões do usuário
  const permissoes = await getPermissoesUsuario(user.id)
  
  // Verificar se pode excluir
  if (!permissoes.pedidos.excluir) {
    throw createError({
      statusCode: 403,
      message: 'Você não tem permissão para excluir pedidos'
    })
  }
  
  // Executar exclusão
  await supabase.from('pedidos').delete().eq('id', pedidoId)
  
  return { success: true }
})
```

## Recomendações de Uso

### ✅ Sempre fazer:

1. **Verificar no frontend** - Para melhor UX (esconder botões que usuário não pode usar)
2. **Verificar no backend** - Para segurança real (nunca confiar apenas no frontend)
3. **Usar RLS no Supabase** - Última camada de segurança (proteção a nível de banco)

### ❌ Nunca fazer:

1. **Confiar apenas no frontend** - Usuário pode chamar funções via console
2. **Verificar permissões depois** da ação - Sempre verificar antes
3. **Permitir acesso direto ao Supabase** do frontend sem RLS

## Exemplo de Implementação Completa

```vue
<!-- components/PedidoActions.vue -->
<template>
  <div class="flex gap-2">
    <!-- Botão só aparece se tiver permissão -->
    <button 
      v-if="permissoesSync?.pedidos.editar"
      @click="editarPedido(pedido.id)"
      class="btn-primary"
    >
      Editar
    </button>
    
    <!-- Botão só aparece se tiver permissão -->
    <button 
      v-if="permissoesSync?.pedidos.excluir"
      @click="confirmarExclusao(pedido.id)"
      class="btn-danger"
    >
      Excluir
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pedido: Pedido }>()

const { permissoesSync, podeExcluirPedido } = usePermissoes()
const toast = useToastSafe()

const confirmarExclusao = async (pedidoId: string) => {
  // Dupla verificação: mesmo que botão apareça, verificar permissão antes de executar
  if (!await podeExcluirPedido()) {
    toast.error('Você não tem permissão para excluir pedidos')
    return
  }
  
  if (confirm('Deseja realmente excluir este pedido?')) {
    try {
      // Chamar endpoint de API (que também verificará permissões no servidor)
      await $fetch(`/api/pedidos/${pedidoId}`, { method: 'DELETE' })
      toast.success('Pedido excluído com sucesso')
    } catch (error) {
      toast.error('Erro ao excluir pedido')
    }
  }
}
</script>
```

## Estrutura de Permissões Atualizada

As permissões agora seguem uma estrutura modular:

```typescript
{
  pedidos: {
    criar: boolean
    editar: boolean
    excluir: boolean
    visualizar: boolean
    alterar_status: boolean
  },
  cardapio: {
    criar_produto: boolean
    editar_produto: boolean
    excluir_produto: boolean
    ativar_desativar: boolean
  },
  relatorios: {
    visualizar: boolean
    exportar: boolean
  },
  configuracoes: {
    editar_empresa: boolean
    gerenciar_usuarios: boolean
  }
}
```

**Nota:** A seção `financeiro` foi removida pois já existe `relatorios` com as mesmas funcionalidades.
