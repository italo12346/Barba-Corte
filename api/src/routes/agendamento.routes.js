const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");

const Agendamento = require("../models/agendamento");
const Horario = require("../models/horario");
const Servico = require("../models/servico");
const mp = require("../services/mercadopagoApi");

const TZ = "America/Sao_Paulo";

/*
=====================================
HELPERS
=====================================
*/

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function generateSlots(inicio, fim, duracao) {
  const slots = [];
  for (let t = inicio; t + duracao <= fim; t += duracao) {
    slots.push(t);
  }
  return slots;
}

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

    if (!salaoId || !servicoId || !clienteId || !colaboradorId || !dataAgendamento) {
      return res.status(400).json({
        error: true,
        message: "Dados obrigatórios não enviados",
      });
    }

    const mData = moment.tz(dataAgendamento, TZ);
    const diaSemana = mData.day();

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

    const inicioMin = hhmmToMinutes(horario.horaInicio);
    const fimMin = hhmmToMinutes(horario.horaFim);
    const agendaMin = mData.hours() * 60 + mData.minutes();

    if (agendaMin < inicioMin || agendaMin >= fimMin) {
      return res.status(400).json({
        error: true,
        message: "Horário fora do expediente",
      });
    }

    const inicio = mData.clone().seconds(0).milliseconds(0).toDate();
    const fim = moment(inicio).add(1, "minute").toDate();

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

    const servico = await Servico.findById(servicoId);

    if (!servico) {
      return res.status(404).json({
        error: true,
        message: "Serviço não encontrado",
      });
    }

    const agendamento = await Agendamento.create({
      salaoId,
      servicoId,
      clienteId,
      colaboradorId,
      dataAgendamento: mData.toDate(),
      valorServico: servico.preco,
      comissao: servico.comissao,
      status: "aguardando_pagamento",
    });

    res.status(201).json({
      error: false,
      agendamento,
    });

  } catch (err) {
    console.error("Erro agendamento:", err);

    res.status(500).json({
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
    const agendamento = await Agendamento.findById(req.params.agendamentoId)
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

    const pagamentoMP = await mp.criarPixPagamento({
      valor: agendamento.valorServico,
      descricao: agendamento.servicoId.titulo,
      email: agendamento.clienteId.email,
    });

    const expiracao = moment().add(30, "minutes").toDate();

    agendamento.pagamento = {
      mpPaymentId: pagamentoMP.id,
      valor: agendamento.valorServico,
      metodo: "pix",
      status: "pendente",
      expiracao,
    };

    await agendamento.save();

    res.status(201).json({
      error: false,
      qrCode: pagamentoMP.point_of_interaction.transaction_data.qr_code,
      qrBase64: pagamentoMP.point_of_interaction.transaction_data.qr_code_base64,
      link: pagamentoMP.point_of_interaction.transaction_data.ticket_url,
      expiracao,
    });

  } catch (err) {
    console.error("Erro PIX:", err);

    res.status(500).json({
      error: true,
      message: "Erro ao gerar PIX",
    });
  }
});

/*
=====================================
FILTRO DE AGENDAMENTOS
=====================================
*/

router.post("/filter", async (req, res) => {
  try {
    const { range, salaoId } = req.body;

    const agendamentos = await Agendamento.find({
      salaoId,
      status: { $in: ["aguardando_pagamento", "confirmado"] },
      dataAgendamento: {
        $gte: moment.tz(range.start, TZ).startOf("day").toDate(),
        $lte: moment.tz(range.end, TZ).endOf("day").toDate(),
      },
    }).populate([
      { path: "servicoId", select: "titulo duracao" },
      { path: "colaboradorId", select: "nome" },
      { path: "clienteId", select: "nome" },
    ]);

    res.json({ error: false, agendamentos });

  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/*
=====================================
DIAS DISPONÍVEIS
=====================================
*/

router.post("/dias-disponiveis", async (req, res) => {
  try {
    const { data, salaoId, servicoId } = req.body;

    if (!data || !salaoId || !servicoId) {
      return res.status(400).json({
        error: true,
        message: "Dados obrigatórios ausentes",
      });
    }

    const TZ = "America/Sao_Paulo";

    /*
    =====================================
    UTILS
    =====================================
    */

    const hhmmToMinutes = (hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };

    const minutesToHHMM = (min) => {
      const h = Math.floor(min / 60);
      const m = min % 60;

      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const generateSlots = (inicio, fim, duracao) => {
      let slots = [];

      for (let t = inicio; t + duracao <= fim; t += duracao) {
        slots.push(t);
      }

      return slots;
    };

    /*
    =====================================
    BUSCA SERVIÇO
    =====================================
    */

    const servico = await Servico.findById(servicoId);

    if (!servico) {
      return res.status(404).json({
        error: true,
        message: "Serviço não encontrado",
      });
    }

    const duracao = servico.duracao || 60;

    /*
    =====================================
    BUSCA HORÁRIOS
    =====================================
    */

    const horarios = await Horario.find({ salaoId });

    let agenda = [];

    let base = moment.tz(data, TZ);

    /*
    =====================================
    GERA 7 DIAS
    =====================================
    */

    for (let i = 0; i < 7; i++) {
      const dia = base.clone().add(i, "days");
      const diaSemana = dia.day();

      const horariosDia = horarios.filter(h =>
        h.diasSemana.includes(diaSemana)
      );

      if (!horariosDia.length) continue;

      let disponibilidadeDia = [];

      for (const h of horariosDia) {
        const inicio = hhmmToMinutes(h.horaInicio);
        const fim = hhmmToMinutes(h.horaFim);

        const slots = generateSlots(inicio, fim, duracao);

        /*
        =====================================
        AGENDAMENTOS DO DIA
        =====================================
        */

        const agendamentos = await Agendamento.find({
          colaboradorId: h.colaboradorId,
          status: { $in: ["aguardando_pagamento", "confirmado"] },
          dataAgendamento: {
            $gte: dia.clone().startOf("day").toDate(),
            $lte: dia.clone().endOf("day").toDate(),
          },
        });

        const ocupados = agendamentos.map(a => {
          const m = moment(a.dataAgendamento).tz(TZ);
          return m.hours() * 60 + m.minutes();
        });

        /*
        =====================================
        MONTA STATUS DOS SLOTS
        =====================================
        */

        const horariosStatus = slots.map(min => ({
          hora: minutesToHHMM(min),
          status: ocupados.includes(min)
            ? "reservado"
            : "livre",
        }));

        disponibilidadeDia.push({
          colaboradorId: h.colaboradorId,
          horarios: horariosStatus,
        });
      }

      if (disponibilidadeDia.length) {
        agenda.push({
          data: dia.format("YYYY-MM-DD"),
          disponibilidade: disponibilidadeDia,
        });
      }
    }

    return res.json({
      error: false,
      agenda,
    });

  } catch (err) {
    console.error("DISPONIBILIDADE ERRO:", err);

    res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});


module.exports = router;
