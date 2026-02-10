const mongoose = require("mongoose");
const { Schema } = mongoose;

/*
=====================
SUBDOCUMENTO PAGAMENTO
=====================
*/
const pagamentoSchema = new Schema(
  {
    mpPaymentId: {
      type: String,
      index: true,
    },

    valor: {
      type: Number,
      required: true,
      min: 0,
    },

    metodo: {
      type: String,
      enum: ["pix"],
      default: "pix",
    },

    status: {
      type: String,
      enum: ["pendente", "aprovado", "cancelado", "expirado"],
      default: "pendente",
    },

    criadoEm: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/*
=====================
AGENDAMENTO
=====================
*/
const agendamentoSchema = new Schema(
  {
    salaoId: {
  type: Schema.Types.ObjectId,
  ref: "Salao",
  required: true,
  index: true,
},

    servicoId: {
      type: Schema.Types.ObjectId,
      ref: "Servico",
      required: true,
      index: true,
    },

    clienteId: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
      index: true,
    },

    colaboradorId: {
      type: Schema.Types.ObjectId,
      ref: "Colaborador",
      required: true,
      index: true,
    },

    dataAgendamento: {
      type: Date,
      required: true,
    },

    // 🔹 snapshot financeiro
    valorServico: {
      type: Number,
      required: true,
      min: 0,
    },

    comissao: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔥 pagamento embutido
    pagamento: pagamentoSchema,

    status: {
      type: String,
      enum: ["aguardando_pagamento", "confirmado", "cancelado"],
      default: "aguardando_pagamento",
      index: true,
    },

    dataVinculo: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Agendamento", agendamentoSchema);
