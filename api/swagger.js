const swaggerJSDoc = require("swagger-jsdoc");


module.exports = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Barbearia",
      version: "1.0.0",
      description: "Documentação da API da Barbearia",
    },
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
    tags: [
      { name: "Colaborador", description: "Gestão de colaboradores" },
      { name: "Horário", description: "Horários de trabalho" },
      { name: "Salão", description: "Salões" },
      { name: "Serviço", description: "Serviços" },
    ],
  },

  // ⚠️ ISSO É CRÍTICO
  apis: ["./src/routes/**/*.js"],
});