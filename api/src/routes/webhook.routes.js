const express = require("express");
const router = express.Router();

const Agendamento = require("../models/agendamento");
const mp = require("../services/mercadopagoApi");

/*
===========================
WEBHOOK MERCADO PAGO
===========================
*/
router.post("/mercadopago", async (req, res) => {
  try {
    const data = req.body;

    // Aceita apenas eventos de pagamento
    if (data.type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data.data?.id;
    if (!paymentId) {
      return res.sendStatus(200);
    }

    // 🔎 Consulta pagamento real no Mercado Pago
    const pagamentoMP = await mp.buscarPagamento(paymentId);

    if (!pagamentoMP) {
      console.log("Pagamento não encontrado no MP:", paymentId);
      return res.sendStatus(200);
    }

    // 🔍 Busca agendamento vinculado
    const agendamento = await Agendamento.findOne({
      "pagamento.mpPaymentId": paymentId,
    });

    if (!agendamento) {
      console.log("Pagamento sem agendamento:", paymentId);
      return res.sendStatus(200);
    }

    // 🔒 Evita alterar agendamento já concluído
    if (agendamento.status === "concluido") {
      return res.sendStatus(200);
    }

    // 🔄 Atualiza status do pagamento
    agendamento.pagamento.status = pagamentoMP.status;

    // 🎯 Atualiza status do agendamento
    switch (pagamentoMP.status) {

      case "approved":
        if (agendamento.status === "aguardando_pagamento") {
          agendamento.status = "confirmado";
        }
        break;

      case "cancelled":
      case "rejected":
        agendamento.status = "cancelado";
        break;

      case "expired":
        agendamento.status = "cancelado";
        break;

      default:
        // mantém aguardando_pagamento
        break;
    }

    await agendamento.save();

    console.log("Webhook atualizado:", paymentId);

    res.sendStatus(200);

  } catch (err) {
    console.error("Webhook erro:", err.message);
    res.sendStatus(500);
  }
});

module.exports = router;
