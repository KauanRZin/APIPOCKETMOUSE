FROM node:22-alpine

# Prisma requer OpenSSL no Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copia arquivos de dependências e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Copia o restante do código-fonte (o .env fica de fora via .dockerignore)
COPY tsconfig.json ./
COPY src ./src/

# Gera o Prisma Client e compila o TypeScript para JavaScript (pasta dist/)
RUN npx prisma generate && npm run build

EXPOSE 3000

# Ao iniciar o container, sincroniza as tabelas no banco e inicia a API
CMD ["sh", "-c", "npx prisma db push && npm start"]
