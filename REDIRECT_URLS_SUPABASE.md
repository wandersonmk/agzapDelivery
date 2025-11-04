# Configuração de Redirect URLs no Supabase

Para que o fluxo de convite funcione corretamente, você precisa adicionar as URLs de redirect no dashboard do Supabase.

## Passo a Passo

### 1. Acessar Configurações de Auth

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**

### 2. Adicionar Redirect URLs

Na seção **Redirect URLs**, adicione as seguintes URLs:

#### Desenvolvimento
```
http://localhost:3000/completar-cadastro
```

#### Produção
```
https://agzap-delivery.vercel.app/completar-cadastro
```

### 3. Configurar Site URL (opcional)

Na seção **Site URL**, você pode definir:

- **Development**: `http://localhost:3000`
- **Production**: `https://agzap-delivery.vercel.app`

### 4. Salvar

Clique em **Save** para aplicar as mudanças.

## Como Funciona o Fluxo

1. **Você envia o convite** através do sistema
2. **Usuário recebe o email** com link de convite
3. **Usuário clica no link** → é redirecionado para `/completar-cadastro`
4. **Página captura o token** da URL (hash)
5. **Usuário define a senha**
6. **Sistema cria a sessão** e redireciona para `/pedidos`

## Troubleshooting

### Erro: "Invalid redirect URL"
- Verifique se a URL está exatamente como configurada no Supabase
- Não esqueça de incluir o protocolo (`http://` ou `https://`)
- Verifique se não há barra final (`/`) extra

### Usuário fica travado após clicar no link
- Verifique se a página `/completar-cadastro` está carregando
- Abra o console do navegador para ver erros
- Verifique se o token está presente na URL (hash com `access_token=...`)

### Email não chega
- Verifique a caixa de spam
- Confirme que o SERVICE_ROLE_KEY está configurado corretamente
- Verifique os logs do servidor para ver se o convite foi enviado

## Testando

Para testar localmente:

1. Reinicie o servidor: `npm run dev`
2. Acesse `/usuarios`
3. Clique em "Novo Usuário"
4. Preencha o email e envie o convite
5. Verifique o email
6. Clique no link → deve redirecionar para `localhost:3000/completar-cadastro`
7. Defina a senha
8. Deve ser redirecionado para `/pedidos`

## Observações Importantes

- O token no link tem validade de **1 hora** por padrão
- Após definir a senha, o usuário pode fazer login normalmente
- O usuário é criado na tabela `auth.users` somente após definir a senha
- Até lá, ele existe apenas nas tabelas públicas (`usuarios` e `usuarios_empresas`)
