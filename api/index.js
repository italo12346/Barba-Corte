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

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/salao", salaoRoutes);
app.use("/servicos", servicosRoutes);
app.use("/horario", horarioRoutes);
app.use("/colaborador", colaboradorRoutes);
app.use("/webhook", webhook);

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Está rodando na porta ${PORT}`);
});
