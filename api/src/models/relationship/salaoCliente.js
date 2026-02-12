const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SalaoCliente = new Schema({
  salaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Salao',
    required: true,
  },

  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },

  status: {
    type: String,
    enum: ['A', 'I'],
    default: 'A',
  },

  dataVinculo: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

SalaoCliente.index(
  { salaoId: 1, clienteId: 1 },
  { unique: true }
);

module.exports = mongoose.model('SalaoCliente', SalaoCliente);
