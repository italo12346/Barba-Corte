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

    // Mercado Pago envia vários tipos de eventos
    if (data.type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data.data.id;

    // 🔥 consulta pagamento no MP
    const pagamento = await mp.buscarPagamento(paymentId);

    // 🔍 encontra agendamento vinculado
    const agendamento = await Agendamento.findOne({
      "pagamento.mpPaymentId": paymentId,
    });

    if (!agendamento) {
      console.log("Pagamento sem agendamento:", paymentId);
      return res.sendStatus(200);
    }

    // 🎯 atualiza status
    agendamento.pagamento.status = pagamento.status;

    if (pagamento.status === "approved") {
      agendamento.status = "confirmado";
    }

    if (
      pagamento.status === "cancelled" ||
      pagamento.status === "rejected"
    ) {
      agendamento.status = "cancelado";
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
