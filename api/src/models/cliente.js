const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
    },
    senha: {
      type: String,
      required: true,
    },
    foto: {
      type: String,
    },
    telefone: {
      type: String,
      required: false,
    },
    dataNascimento: {
      type: Date,
      required: false,
    },
    sexo: {
      type: String,
      enum: ["M", "F", "O"],
      required: false,
    },
    status: {
      type: String,
      enum: ["ATIVO", "INATIVO"],
      default: "ATIVO",
    },

    documento: {
      tipo: { type: String, enum: ["CPF", "CNPJ"], required: false },
      numero: { type: String, required: false, unique: true },
    },
    endereco: {
      cidade: String,
      uf: String,
      cep: String,
      numero: String,
      pais: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Cliente || mongoose.model("Cliente", clienteSchema);
