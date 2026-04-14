const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SalaoSchema = new Schema(
  {
    nome: { type: String, required: true, unique: true },
    foto: { type: String, required: false },
    capa: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    senha: String,
    telefone: { type: String, required: false },
    endereco: {
      logradouro: String,
      cidade: String,
      uf: String,
      cep: String,
      numero: String,
      pais: String,
    },
    geo: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] },
    },
  },
  { timestamps: true },
);

SalaoSchema.index({ geo: "2dsphere" });
module.exports = mongoose.model("Salao", SalaoSchema);
