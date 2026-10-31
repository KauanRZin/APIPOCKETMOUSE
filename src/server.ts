import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de status da API
app.get("/", (_req, res) => {
  res.json({
    message: "API PocketMouse rodando!",
    endpoints: {
      auth: {
        register: "POST /auth/register",
        login: "POST /auth/login",
        google: "POST /auth/google",
        me: "GET /auth/me (Bearer Token)",
      },
      users: {
        listAll: "GET /users (Pública - sem JWT)",
        getById: "GET /users/:id (Pública - sem JWT)",
      },
      profiles: {
        list: "GET /profiles (Bearer Token)",
        create: "POST /profiles (Bearer Token)",
        update: "PUT /profiles/:id (Bearer Token)",
        delete: "DELETE /profiles/:id (Bearer Token)",
      },
    },
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
