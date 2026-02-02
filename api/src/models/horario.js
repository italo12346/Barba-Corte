const mongoose = require("mongoose");
const colaborador = require("./colaborador");

const horarioSchema = new mongoose.Schema({
  salaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  especialidades: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servico",
      required: true,
    },
  ],
  colaboradores: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Colaborador",
      required: true,
    },
  ],
    diasSemana: {
        type:[Number],
        required:true,
    },
    inicio: {
        type: Date,
        required: true,
    },
    fim: {
        type: Date,
        required: true,
    },
},{
    timestamps: true,
});

module.exports = mongoose.model("Horario", horarioSchema);
