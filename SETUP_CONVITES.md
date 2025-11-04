# 📧 Configuração de Convites de Usuários

Para que o sistema consiga enviar convites por email para novos usuários, você precisa configurar a **SERVICE_ROLE_KEY** do Supabase.

---

## 🔑 Passo 1: Obter a SERVICE_ROLE_KEY

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto: **Agzap Delivery**
3. Vá em: **Settings** (⚙️) → **API**
4. Na seção **Project API keys**, copie a chave **`service_role`** (secret)

⚠️ **ATENÇÃO:** Esta chave é **SECRETA** e **NUNCA** deve ser exposta no frontend ou commitada no Git!

---

## 🛠️ Passo 2: Adicionar no arquivo .env

Abra o arquivo `.env` na raiz do projeto e adicione:

```bash
# Já existentes
NUXT_PUBLIC_SUPABASE_URL=https://ibdtonnefyprlenjxhcg.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# ADICIONAR ESTA LINHA com sua service_role key:
NUXT_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (sua service_role key aqui)
```

---

## 🚀 Passo 3: Reiniciar o servidor

Após adicionar a chave, reinicie o servidor de desenvolvimento:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## ☁️ Configuração no Vercel (Produção)

Para funcionar em produção no Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto: **agzap-delivery**
3. Vá em: **Settings** → **Environment Variables**
4. Adicione uma nova variável:
   - **Name:** `NUXT_SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (cole sua service_role key)
   - **Environment:** Production
5. Clique em **Save**
6. Faça um novo deploy (push no Git ou Redeploy manual)

---

## ✅ Como Testar

1. Acesse a página de **Gerenciar Usuários**
2. Clique em **Adicionar Usuário**
3. Preencha:
   - Email: `teste@exemplo.com`
   - Papel: Atendente
4. Clique em **Enviar Convite**

Se tudo estiver configurado corretamente:
- ✅ Você verá "Convite enviado com sucesso!"
- ✅ O usuário receberá um email do Supabase
- ✅ O vínculo será criado no banco de dados

---

## 🐛 Solução de Problemas

### Erro: "403 Forbidden"
**Causa:** SERVICE_ROLE_KEY não configurada ou inválida

**Solução:**
1. Verifique se adicionou `NUXT_SUPABASE_SERVICE_ROLE_KEY` no `.env`
2. Confirme que copiou a chave **service_role** (não a anon key)
3. Reinicie o servidor

### Erro: "Configuração do servidor incompleta"
**Causa:** Variável de ambiente não foi carregada

**Solução:**
1. Verifique se o arquivo `.env` está na raiz do projeto
2. Certifique-se que o nome é exatamente `NUXT_SUPABASE_SERVICE_ROLE_KEY`
3. Reinicie o servidor completamente

### Email não chega
**Causas possíveis:**
1. Email pode estar no **Spam/Lixo Eletrônico**
2. Supabase em modo de desenvolvimento limita emails
3. Email pode levar alguns minutos para chegar

**Soluções:**
1. Verifique a pasta de Spam
2. Em desenvolvimento, o Supabase pode não enviar emails reais
3. Use emails reais (não temporários)
4. Configure SMTP personalizado no Supabase (Settings → Auth → SMTP)

---

## 📚 Documentação Oficial

- [Supabase Auth Admin API](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Invite Users](https://supabase.com/docs/reference/javascript/auth-admin-inviteuser)
- [Environment Variables Nuxt](https://nuxt.com/docs/guide/going-further/runtime-config)

---

## 🔒 Segurança

✅ **Correto:**
- `NUXT_SUPABASE_SERVICE_ROLE_KEY` (privada, só servidor)
- Nunca commitar no Git
- Usar apenas em endpoints `/server/api`

❌ **NUNCA:**
- Expor no código do cliente
- Usar em composables
- Commitar no repositório
- Logar no console do browser
