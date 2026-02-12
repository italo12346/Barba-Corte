const mongoose = require("mongoose");

const ColaboradorSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    foto: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    senha: {
      type: String,
      required: true,
    },

    telefone: {
      type: String,
      required: true,
    },

    dataNascimento: {
      type: Date,
      required: true,
    },

    sexo: {
      type: String,
      enum: ["M", "F"],
      required: true,
    },

    status: {
      type: String,
      enum: ["A", "I"],
      default: "A",
    },

    // Integração Mercado Pago
    mercadoPago: {
      userId: String,
      accessToken: String,
      refreshToken: String,
      connected: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

// Índices úteis
ColaboradorSchema.index({ email: 1 });
ColaboradorSchema.index({ status: 1 });

module.exports = mongoose.model("Colaborador", ColaboradorSchema);
