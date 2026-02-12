const express = require("express");
const router = express.Router();
const moment = require("moment");

const Agendamento = require("../models/agendamento");
const Horario = require("../models/horario");
const Servico = require("../models/servico");
const mp = require("../services/mercadopagoApi");

/*
=====================================
CRIAR AGENDAMENTO
=====================================
*/
router.post("/", async (req, res) => {
  try {
    const {
      salaoId,
      servicoId,
      clienteId,
      colaboradorId,
      dataAgendamento,
    } = req.body;

    if (
      !salaoId ||
      !servicoId ||
      !clienteId ||
      !colaboradorId ||
      !dataAgendamento
    ) {
      return res.status(400).json({
        error: true,
        message: "Dados obrigatórios não enviados",
      });
    }

    // ✅ converte para data local
    const data = new Date(dataAgendamento);
    const mData = moment(data).local();

    const diaSemana = mData.day(); // 0 domingo — 6 sábado

    /*
    ==========================
    VALIDA EXPEDIENTE
    ==========================
    */
    const horario = await Horario.findOne({
      salaoId,
      colaboradorId,
      diasSemana: diaSemana,
    });

    if (!horario) {
      return res.status(400).json({
        error: true,
        message: "Colaborador não trabalha nesse dia",
      });
    }

    const [hi, mi] = horario.horaInicio.split(":");
    const [hf, mf] = horario.horaFim.split(":");

    const inicioMin = +hi * 60 + +mi;
    const fimMin = +hf * 60 + +mf;

    const agendaMin = mData.hours() * 60 + mData.minutes();

    console.log("Hora local:", mData.format("HH:mm"));

    if (agendaMin < inicioMin || agendaMin >= fimMin) {
      return res.status(400).json({
        error: true,
        message: "Horário fora do expediente",
      });
    }

    /*
    ==========================
    CONFLITO DE HORÁRIO
    ==========================
    */

    // bloqueia agendamento no mesmo minuto
    const inicio = new Date(data);
    inicio.setSeconds(0, 0);

    const fim = new Date(inicio);
    fim.setMinutes(inicio.getMinutes() + 1);

    const conflito = await Agendamento.findOne({
      colaboradorId,
      dataAgendamento: { $gte: inicio, $lt: fim },
      status: { $in: ["aguardando_pagamento", "confirmado"] },
    });

    if (conflito) {
      return res.status(409).json({
        error: true,
        message: "Horário já reservado",
      });
    }

    /*
    ==========================
    SNAPSHOT FINANCEIRO
    ==========================
    */
    const servico = await Servico.findById(servicoId);

    if (!servico) {
      return res.status(404).json({
        error: true,
        message: "Serviço não encontrado",
      });
    }

    /*
    ==========================
    CRIA AGENDAMENTO
    ==========================
    */
    const agendamento = await Agendamento.create({
      salaoId,
      servicoId,
      clienteId,
      colaboradorId,
      dataAgendamento: data,
      valorServico: servico.preco,
      comissao: servico.comissao,
      status: "aguardando_pagamento",
    });

    return res.status(201).json({
      error: false,
      agendamento,
    });
  } catch (err) {
    console.error("Erro agendamento:", err);

    return res.status(500).json({
      error: true,
      message: "Erro ao criar agendamento",
    });
  }
});

/*
=====================================
GERAR PIX
=====================================
*/
router.post("/pix/:agendamentoId", async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(
      req.params.agendamentoId
    )
      .populate("clienteId")
      .populate("servicoId");

    if (!agendamento) {
      return res.status(404).json({
        error: true,
        message: "Agendamento não encontrado",
      });
    }

    if (agendamento.status === "confirmado") {
      return res.status(400).json({
        error: true,
        message: "Agendamento já confirmado",
      });
    }

    // evita PIX duplicado válido
    if (
      agendamento.pagamento &&
      agendamento.pagamento.status === "pendente" &&
      agendamento.pagamento.expiracao > new Date()
    ) {
      return res.status(409).json({
        error: true,
        message: "Pagamento pendente existente",
      });
    }

    /*
    ==========================
    MERCADO PAGO PIX
    ==========================
    */
    const pagamentoMP = await mp.criarPixPagamento({
      valor: agendamento.valorServico,
      descricao: agendamento.servicoId.titulo,
      email: agendamento.clienteId.email,
    });

    const expiracao = new Date(Date.now() + 30 * 60 * 1000);

    agendamento.pagamento = {
      mpPaymentId: pagamentoMP.id,
      valor: agendamento.valorServico,
      metodo: "pix",
      status: "pendente",
      expiracao,
    };

    await agendamento.save();

    return res.status(201).json({
      error: false,
      qrCode:
        pagamentoMP.point_of_interaction.transaction_data.qr_code,
      qrBase64:
        pagamentoMP.point_of_interaction.transaction_data
          .qr_code_base64,
      link:
        pagamentoMP.point_of_interaction.transaction_data.ticket_url,
      expiracao,
    });
  } catch (err) {
    console.error("Erro PIX:", err);

    return res.status(500).json({
      error: true,
      message: "Erro ao gerar PIX",
    });
  }
});

module.exports = router;
