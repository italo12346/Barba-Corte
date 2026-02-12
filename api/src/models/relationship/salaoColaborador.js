const mongoose = require("mongoose");

const SalaoColaboradorSchema = new mongoose.Schema(
  {
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
      enum: ["A", "I", "E"],
      default: "A",
    },
  },
  { timestamps: true }
);

// 🔒 evita duplicidade
SalaoColaboradorSchema.index(
  { salaoId: 1, colaboradorId: 1 },
  { unique: true }
);

// performance
SalaoColaboradorSchema.index({ salaoId: 1 });
SalaoColaboradorSchema.index({ colaboradorId: 1 });

module.exports = mongoose.model(
  "SalaoColaborador",
  SalaoColaboradorSchema
);
