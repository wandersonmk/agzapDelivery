# 🔐 PAPÉIS E PERMISSÕES DO SISTEMA

> **Última atualização:** 04 de Novembro de 2025  
> **Sistema:** Agzap Delivery - Gestão de Pedidos

---

## 📊 TABELA DE PERMISSÕES POR PAPEL

| Papel | Pedidos | Cardápio | Relatórios | Financeiro | Config |
|-------|---------|----------|------------|------------|--------|
| 👑 **Proprietário** | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total |
| ⚙️ **Admin** | ✅ Total | ✅ Total | ✅ Total | ✅ Total | ✅ Total |
| 📊 **Gerente** | ✅ Criar/Editar | ✅ Criar/Editar | ✅ Ver/Exportar | ✅ Ver/Relat | ❌ |
| 🎧 **Atendente** | ✅ Criar/Editar | ❌ | ❌ | ✅ Ver | ❌ |
| 🔪 **Cozinha** | 👁️ Visualizar | ❌ | ❌ | ❌ | ❌ |
| 🏍️ **Entregador** | 👁️ Visualizar | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 DETALHAMENTO DAS PERMISSÕES

### 👑 PROPRIETÁRIO
**Acesso total ao sistema**

#### Pedidos:
- ✅ Criar pedidos
- ✅ Editar pedidos
- ✅ Excluir pedidos
- ✅ Visualizar pedidos
- ✅ Alterar status

#### Cardápio:
- ✅ Criar produtos
- ✅ Editar produtos
- ✅ Excluir produtos
- ✅ Ativar/Desativar produtos

#### Relatórios:
- ✅ Visualizar relatórios
- ✅ Exportar dados

#### Financeiro:
- ✅ Visualizar valores
- ✅ Gerar relatórios financeiros

#### Configurações:
- ✅ Editar empresa
- ✅ Gerenciar usuários

#### Páginas Acessíveis:
- ✅ Dashboard
- ✅ Pedidos
- ✅ Cardápio
- ✅ Clientes
- ✅ Cupons
- ✅ Relatórios
- ✅ Configurações
- ✅ Ajuda

---

### ⚙️ ADMIN
**Mesmas permissões do Proprietário**

#### Pedidos:
- ✅ Criar pedidos
- ✅ Editar pedidos
- ✅ Excluir pedidos
- ✅ Visualizar pedidos
- ✅ Alterar status

#### Cardápio:
- ✅ Criar produtos
- ✅ Editar produtos
- ✅ Excluir produtos
- ✅ Ativar/Desativar produtos

#### Relatórios:
- ✅ Visualizar relatórios
- ✅ Exportar dados

#### Financeiro:
- ✅ Visualizar valores
- ✅ Gerar relatórios financeiros

#### Configurações:
- ✅ Editar empresa
- ✅ Gerenciar usuários

#### Páginas Acessíveis:
- ✅ Dashboard
- ✅ Pedidos
- ✅ Cardápio
- ✅ Clientes
- ✅ Cupons
- ✅ Relatórios
- ✅ Configurações
- ✅ Ajuda

---

### 📊 GERENTE
**Gestão operacional sem excluir dados**

#### Pedidos:
- ✅ Criar pedidos
- ✅ Editar pedidos
- ❌ Excluir pedidos
- ✅ Visualizar pedidos
- ✅ Alterar status

#### Cardápio:
- ✅ Criar produtos
- ✅ Editar produtos
- ❌ Excluir produtos
- ✅ Ativar/Desativar produtos

#### Relatórios:
- ✅ Visualizar relatórios
- ✅ Exportar dados

#### Financeiro:
- ✅ Visualizar valores
- ✅ Gerar relatórios financeiros

#### Configurações:
- ❌ Editar empresa
- ❌ Gerenciar usuários

#### Páginas Acessíveis:
- ✅ Dashboard
- ✅ Pedidos
- ✅ Cardápio
- ✅ Clientes
- ✅ Cupons (apenas visualização)
- ✅ Relatórios
- ❌ Configurações
- ✅ Ajuda

---

### 🎧 ATENDENTE
**Foco em atendimento e pedidos**

#### Pedidos:
- ✅ Criar pedidos
- ✅ Editar pedidos
- ❌ Excluir pedidos
- ✅ Visualizar pedidos
- ✅ Alterar status

#### Cardápio:
- ❌ Criar produtos
- ❌ Editar produtos
- ❌ Excluir produtos
- ❌ Ativar/Desativar produtos

#### Relatórios:
- ❌ Visualizar relatórios
- ❌ Exportar dados

#### Financeiro:
- ✅ Visualizar valores (para calcular pedidos)
- ❌ Gerar relatórios financeiros

#### Configurações:
- ❌ Editar empresa
- ❌ Gerenciar usuários

#### Páginas Acessíveis:
- ❌ Dashboard (contém dados financeiros)
- ✅ Pedidos (com botão Novo Pedido)
- ❌ Cardápio
- ✅ Clientes (precisa ver dados para atendimento)
- ❌ Cupons
- ❌ Relatórios
- ❌ Configurações
- ❌ Ajuda

---

### 🔪 COZINHA
**Apenas visualização e mudança de status**

#### Pedidos:
- ❌ Criar pedidos
- ❌ Editar pedidos
- ❌ Excluir pedidos
- ✅ Visualizar pedidos
- ✅ Alterar status (Aceitar → Pronto)

#### Cardápio:
- ❌ Criar produtos
- ❌ Editar produtos
- ❌ Excluir produtos
- ❌ Ativar/Desativar produtos

#### Relatórios:
- ❌ Visualizar relatórios
- ❌ Exportar dados

#### Financeiro:
- ❌ Visualizar valores
- ❌ Gerar relatórios financeiros

#### Configurações:
- ❌ Editar empresa
- ❌ Gerenciar usuários

#### Páginas Acessíveis:
- ❌ Dashboard
- ✅ Pedidos (SEM botão Novo Pedido)
- ❌ Cardápio
- ❌ Clientes
- ❌ Cupons
- ❌ Relatórios
- ❌ Configurações
- ❌ Ajuda

---

### 🏍️ ENTREGADOR
**Apenas visualização e mudança de status**

#### Pedidos:
- ❌ Criar pedidos
- ❌ Editar pedidos
- ❌ Excluir pedidos
- ✅ Visualizar pedidos
- ✅ Alterar status (Saiu p/ Entrega → Concluído)

#### Cardápio:
- ❌ Criar produtos
- ❌ Editar produtos
- ❌ Excluir produtos
- ❌ Ativar/Desativar produtos

#### Relatórios:
- ❌ Visualizar relatórios
- ❌ Exportar dados

#### Financeiro:
- ❌ Visualizar valores
- ❌ Gerar relatórios financeiros

#### Configurações:
- ❌ Editar empresa
- ❌ Gerenciar usuários

#### Páginas Acessíveis:
- ❌ Dashboard
- ✅ Pedidos (SEM botão Novo Pedido)
- ❌ Cardápio
- ❌ Clientes
- ❌ Cupons
- ❌ Relatórios
- ❌ Configurações
- ❌ Ajuda

---

## 🔄 MAPEAMENTO DE ROTAS → PERMISSÕES

| Rota | Permissão Necessária | Quem Acessa |
|------|---------------------|-------------|
| `/` (Dashboard) | `relatorios.visualizar` | Proprietário, Admin, Gerente |
| `/pedidos` | `pedidos.visualizar` | Todos |
| `/cardapio` | `cardapio.criar_produto` | Proprietário, Admin, Gerente |
| `/clientes` | `financeiro.visualizar_valores` | Proprietário, Admin, Gerente, Atendente |
| `/cupons` | `configuracoes.gerenciar_usuarios` | Proprietário, Admin |
| `/relatorios` | `relatorios.visualizar` | Proprietário, Admin, Gerente |
| `/configuracoes` | `configuracoes.editar_empresa` | Proprietário, Admin |
| `/ajuda` | `financeiro.visualizar_valores` | Proprietário, Admin, Gerente, Atendente |
| `/acesso-negado` | - | Todos (quando negado) |

---

## 🎯 FLUXO DE STATUS DE PEDIDOS

```
┌──────────┐
│   NOVO   │  ← Cliente faz pedido
└─────┬────┘
      │ Cozinha/Atendente: "Aceitar"
      ↓
┌──────────┐
│ COZINHA  │  ← Preparando pedido
└─────┬────┘
      │ Cozinha: "Pronto"
      ↓
┌──────────┐
│ ENTREGA  │  ← Saiu para entrega (se delivery)
└─────┬────┘
      │ Entregador: "Concluir"
      ↓
┌──────────┐
│CONCLUÍDO │  ← Pedido finalizado
└──────────┘
```

**Atalho para Retirada:**
```
NOVO → COZINHA → CONCLUÍDO
```

---

## 🗂️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `usuarios_empresas`

```sql
{
  "id": "uuid",
  "usuario_id": "uuid",
  "empresa_id": "uuid",
  "papel": "proprietario|admin|gerente|atendente|cozinha|entregador",
  "permissoes": {
    "pedidos": {
      "criar": boolean,
      "editar": boolean,
      "excluir": boolean,
      "visualizar": boolean,
      "alterar_status": boolean
    },
    "cardapio": {
      "criar_produto": boolean,
      "editar_produto": boolean,
      "excluir_produto": boolean,
      "ativar_desativar": boolean
    },
    "relatorios": {
      "visualizar": boolean,
      "exportar": boolean
    },
    "configuracoes": {
      "editar_empresa": boolean,
      "gerenciar_usuarios": boolean
    },
    "financeiro": {
      "visualizar_valores": boolean,
      "gerar_relatorios": boolean
    }
  },
  "ativo": boolean
}
```

---

## 🔧 COMO ALTERAR PERMISSÕES NO BANCO

### ⚠️ IMPORTANTE: Sempre alterar `papel` E `permissoes` juntos!

### Exemplo 1: Mudar usuário para Atendente

```sql
UPDATE usuarios_empresas
SET 
  papel = 'atendente',
  permissoes = '{
    "pedidos": {
      "criar": true,
      "editar": true,
      "excluir": false,
      "visualizar": true,
      "alterar_status": true
    },
    "cardapio": {
      "criar_produto": false,
      "editar_produto": false,
      "excluir_produto": false,
      "ativar_desativar": false
    },
    "relatorios": {
      "visualizar": false,
      "exportar": false
    },
    "configuracoes": {
      "editar_empresa": false,
      "gerenciar_usuarios": false
    },
    "financeiro": {
      "visualizar_valores": true,
      "gerar_relatorios": false
    }
  }'::jsonb
WHERE usuario_id = 'UUID_DO_USUARIO'
  AND empresa_id = 'UUID_DA_EMPRESA';
```

### Exemplo 2: Mudar usuário para Cozinha

```sql
UPDATE usuarios_empresas
SET 
  papel = 'cozinha',
  permissoes = '{
    "pedidos": {
      "criar": false,
      "editar": false,
      "excluir": false,
      "visualizar": true,
      "alterar_status": true
    },
    "cardapio": {
      "criar_produto": false,
      "editar_produto": false,
      "excluir_produto": false,
      "ativar_desativar": false
    },
    "relatorios": {
      "visualizar": false,
      "exportar": false
    },
    "configuracoes": {
      "editar_empresa": false,
      "gerenciar_usuarios": false
    },
    "financeiro": {
      "visualizar_valores": false,
      "gerar_relatorios": false
    }
  }'::jsonb
WHERE usuario_id = 'UUID_DO_USUARIO'
  AND empresa_id = 'UUID_DA_EMPRESA';
```

---

## 📝 NOTAS IMPORTANTES

1. **Dashboard restrito:** Atendente e Cozinha NÃO podem acessar o dashboard pois contém informações financeiras sensíveis.

2. **Botão "Novo Pedido":** Só aparece para usuários com `pedidos.criar = true` (Atendente e acima).

3. **Menu dinâmico:** O menu lateral filtra automaticamente as opções baseado nas permissões do usuário.

4. **Middleware de proteção:** Rotas são protegidas por middleware que verifica permissões antes de permitir acesso.

5. **Redirecionamentos:**
   - Login → `/pedidos` (página padrão)
   - Sem permissão para Dashboard → `/pedidos`
   - Sem permissão para outras rotas → `/acesso-negado`

6. **Logout obrigatório:** Após alterar permissões no banco, o usuário DEVE fazer logout e login para carregar as novas permissões.

---

## 🎓 REGRAS DE NEGÓCIO

### ✅ O que SEMPRE verificar:

1. **Campos obrigatórios no banco:**
   - `papel`: Define o "label" do usuário
   - `permissoes`: JSONB que REALMENTE controla o acesso

2. **Alteração de papel:**
   - NUNCA alterar só o campo `papel`
   - SEMPRE atualizar `permissoes` junto

3. **Sistema de verificação:**
   - Menu → usa `temPermissao(modulo, acao)`
   - Middleware → usa `getRoutePermission(path)`
   - Componentes → usam `temPermissao(modulo, acao)` com `v-if`

### ❌ O que NUNCA fazer:

1. ❌ Mudar só o `papel` sem atualizar `permissoes`
2. ❌ Confiar apenas no campo `papel` para controle de acesso
3. ❌ Esquecer de pedir logout/login após alterar permissões
4. ❌ Dar acesso ao Dashboard para Cozinha/Atendente

---

## 📞 CONTATO E SUPORTE

**Sistema:** Agzap Delivery  
**Desenvolvedor:** Wanderson  
**Repositório:** agzapDelivery  
**Branch:** main  
**Última atualização:** 04/11/2025

---

**🔐 Mantenha este documento atualizado sempre que houver mudanças nas permissões!**
