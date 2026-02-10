const mongoose = require("mongoose");

const SalaoColaborador = new mongoose.Schema({
  salaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salao",
    required: true,
  },

  colaboradorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },

  status: {
    type: String,
    enum: ["A", "I", "E"], // ✅ aqui está a correção
    default: "A",
  },

},
{
    timestamps: true,
});

module.exports = mongoose.model(
  "SalaoColaborador",
  SalaoColaborador
);
