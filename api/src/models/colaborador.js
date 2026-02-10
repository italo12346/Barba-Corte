const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ColaboradorSchema = new Schema({
  nome: { type: String, required: true },
  foto: { type: String },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  telefone: { type: String, required: true },
  dataNascimento: { type: Date, required: true },
  sexo: { type: String, enum: ["M", "F"], required: true },
  status: { type: String, enum: ["ATIVO", "INATIVO"], default: "ATIVO" },

  // vínculo Mercado Pago
  mercadoPago: {
    userId: String,
    accessToken: String,
    refreshToken: String,
    connected: { type: Boolean, default: false }
  },

  dataCadastro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Colaborador', ColaboradorSchema)