const mongoose = require("mongoose");

const ColaboradorServicoSchema = new mongoose.Schema(
  {
    servicoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servico",
      required: true,
    },

    colaboradorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Colaborador",
      required: true,
    },

    status: {
      type: String,
      enum: ["A", "I"],
      default: "A",
    },

    dataVinculo: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 🔒 evita duplicidade de vínculo
ColaboradorServicoSchema.index(
  { servicoId: 1, colaboradorId: 1 },
  { unique: true }
);

// performance
ColaboradorServicoSchema.index({ colaboradorId: 1 });
ColaboradorServicoSchema.index({ servicoId: 1 });

module.exports = mongoose.model(
  "ColaboradorServico",
  ColaboradorServicoSchema
);
