# API PocketMouse (Node.js + TypeScript + JWT + PostgreSQL)

API simples de autenticação de usuários (com JWT e suporte a login com Google) e gerenciamento de perfis de sensibilidade de mouse.

## 1. Como configurar o Banco de Dados (PostgreSQL na Nuvem)

Abra o arquivo `.env` na raiz do projeto e substitua o valor de `DATABASE_URL` pela URL do seu banco PostgreSQL na nuvem (Neon, Supabase, Railway, Render, etc.):

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST_DO_BANCO:5432/NOME_DO_BANCO?sslmode=require"
```

Depois de colocar sua URL no `.env`, crie as tabelas automaticamente no banco rodando:

```bash
npm run db:push
```

*(Opcional: se preferir criar as tabelas manualmente no painel SQL do seu banco na nuvem, basta copiar e executar o conteúdo de `database.sql`).*

## 2. Como rodar o projeto

```bash
# Instalar dependências (caso ainda não tenha instalado)
npm install

# Rodar em modo desenvolvimento (com hot-reload)
npm run dev
```

O servidor iniciará em `http://localhost:3000`.

---

## 3. Endpoints da API

### Autenticação (`/auth`)

- **`POST /auth/register`** — Cadastra um novo usuário e já retorna o token JWT.
  ```json
  {
    "name": "Usuário 1",
    "email": "usuario1@email.com",
    "password": "123456"
  }
  ```

- **`POST /auth/login`** — Faz login e retorna o token JWT.
  ```json
  {
    "email": "usuario1@email.com",
    "password": "123456"
  }
  ```

- **`POST /auth/google`** — Login com Google (aceita `idToken` oficial do Google OAuth ou `{ "googleId": "...", "email": "...", "name": "..." }`).

- **`GET /auth/me`** — Retorna os dados do usuário logado e seus perfis (Requer Header `Authorization: Bearer SEU_TOKEN`).

---

### Perfis de Sensibilidade do Mouse (`/profiles`)

Todas as rotas abaixo exigem o Header:
`Authorization: Bearer SEU_TOKEN_JWT`

- **`POST /profiles`** — Cria um perfil de configuração de sensibilidade (aceita campos em inglês ou português, de `0.1` até `3.0` / `3x`, sendo `1.0` o normal):
  ```json
  {
    "name": "Casa",
    "sensitivity": 1.25
  }
  ```
  *(Também aceita `{ "nome": "Casa", "sensibilidade": 1.50 }`, `"normal"` -> `1.0` ou `"3x"` -> `3.0`)*

- **`GET /profiles`** — Lista todos os perfis de sensibilidade do usuário logado.
  Exemplo de retorno:
  ```json
  [
    {
      "id": 1,
      "userId": 1,
      "name": "Casa",
      "sensitivity": 1.25,
      "user": {
        "id": 1,
        "name": "Usuário 1",
        "email": "usuario1@email.com"
      }
    }
  ]
  ```

- **`PUT /profiles/:id`** — Atualiza o nome ou a sensibilidade de um perfil.
  ```json
  {
    "name": "Casa",
    "sensitivity": 1.50
  }
  ```

- **`DELETE /profiles/:id`** — Remove um perfil de sensibilidade.
