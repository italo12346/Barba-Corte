require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

require("./src/database/connection");

const salaoRoutes = require("./src/routes/salao.routes");
const servicosRoutes = require("./src/routes/servicos.routes");

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Routes
app.use("/salao", salaoRoutes);
app.use("/servicos", servicosRoutes);

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Está rodando na porta ${PORT}`);
});
