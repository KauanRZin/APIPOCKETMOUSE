-- Script SQL opcional (caso prefira criar as tabelas direto no painel do seu banco PostgreSQL na nuvem,
-- em vez de rodar `npm run db:push`)

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT,
  "googleId" TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS "mouse_profiles" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "sensitivity" DOUBLE PRECISION NOT NULL DEFAULT 1.0 CHECK ("sensitivity" > 0 AND "sensitivity" <= 3.0)
);
