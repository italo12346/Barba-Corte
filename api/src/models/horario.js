const mongoose = require("mongoose");

const horarioSchema = new mongoose.Schema(
  {
    salaoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salao",
      required: true,
      index: true,
    },

    colaboradorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Colaborador",
      required: true,
      index: true,
    },

    diasSemana: {
      type: [Number], // 0 = Domingo ... 6 = Sábado
      required: true,
    },

    horaInicio: {
      type: String, // "13:30"
      required: true,
    },

    horaFim: {
      type: String, // "18:00"
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Horario", horarioSchema);
