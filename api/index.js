require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

require("./src/database/connection");

const salaoRoutes = require("./src/routes/salao.routes");
const servicosRoutes = require("./src/routes/servicos.routes");
const horarioRoutes = require("./src/routes/horario.routes");
const colaboradorRoutes = require("./src/routes/colaborador.routes");
const webhook = require("./src/routes/webhook.routes");
const agendamentoRoutes = require("./src/routes/agendamento.routes");
const clienteRoutes = require("./src/routes/cliente.routes");
const authRoutes = require("./src/routes/auth.routes");
const app = express();
const authMiddleware = require("./src/middleware/authMiddleware");

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🔓 Rotas públicas
app.use("/auth", authRoutes);
app.use("/webhook", webhook); // geralmente webhook não usa auth

// 🔐 Rotas protegidas (TODAS usam token)
app.use("/salao", authMiddleware, salaoRoutes);
app.use("/servicos", authMiddleware, servicosRoutes);
app.use("/horario", authMiddleware, horarioRoutes);
app.use("/colaborador", authMiddleware, colaboradorRoutes);
app.use("/agendamento", authMiddleware, agendamentoRoutes);
app.use("/cliente", authMiddleware, clienteRoutes);

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Está rodando na porta ${PORT}`);
});
