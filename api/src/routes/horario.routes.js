const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");

const Horario = require("../models/horario");

const TZ = "America/Sao_Paulo";

/*
=====================================
UTILS
=====================================
*/

// valida HH:mm (strict parsing)
function validarHora(hhmm) {
  if (typeof hhmm !== "string") return false;
  return moment(hhmm, "HH:mm", true).isValid();
}

// converte HH:mm → minutos do dia com timezone fixo
function toMinutes(hhmm) {
  const m = moment.tz(hhmm, "HH:mm", TZ);
  return m.hours() * 60 + m.minutes();
}

/*
=====================================
CRIAR HORÁRIO
=====================================
*/

router.post("/", async (req, res) => {
  try {
    const { salaoId, colaboradorId, diasSemana, horaInicio, horaFim } =
      req.body;

    /*
    =========================
    VALIDAÇÕES BÁSICAS
    =========================
    */

    if (!salaoId || !colaboradorId || !Array.isArray(diasSemana)) {
      return res.status(400).json({
        message: "Dados obrigatórios inválidos",
      });
    }

    // valida dias da semana
    const diasInvalidos = diasSemana.some((d) => d < 0 || d > 6);
    if (diasInvalidos) {
      return res.status(400).json({
        message: "Dias da semana inválidos",
      });
    }

    // valida formato hora
    if (!validarHora(horaInicio) || !validarHora(horaFim)) {
      return res.status(400).json({
        message: "Formato de hora inválido (use HH:mm)",
      });
    }

    const inicio = toMinutes(horaInicio);
    const fim = toMinutes(horaFim);

    if (inicio >= fim) {
      return res.status(400).json({
        message: "Hora inicial deve ser menor que a final",
      });
    }

    /*
    =========================
    VERIFICA SOBREPOSIÇÃO
    =========================
    */

    const existentes = await Horario.find({
      salaoId,
      colaboradorId,
      diasSemana: { $in: diasSemana },
    });

    for (const h of existentes) {
      const diasEmComum = h.diasSemana.filter((d) => diasSemana.includes(d));

      if (diasEmComum.length === 0) continue;

      const ei = toMinutes(h.horaInicio);
      const ef = toMinutes(h.horaFim);

      const conflito = inicio < ef && fim > ei;

      if (conflito) {
        return res.status(409).json({
          message: "Horário conflita com expediente existente",
        });
      }
    }

    /*
    =========================
    CRIA HORÁRIO
    =========================
    */

    const horario = await Horario.create({
      salaoId,
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim,
      timezone: TZ, // opcional — ajuda auditoria futura
    });

    return res.status(201).json({ horario });
  } catch (err) {
    console.error("Erro horário:", err);

    return res.status(500).json({
      message: "Erro ao cadastrar horário",
    });
  }
});

/*
=====================================
BUSCAR HORÁRIOS
=====================================
*/

router.get("/", async (req, res) => {
  try {
    const { salaoId, colaboradorId, diaSemana } = req.query;

    // Valida parâmetros básicos
    if (!salaoId) {
      return res.status(400).json({ message: "salaoId é obrigatório" });
    }

    const filtro = { salaoId };

    if (colaboradorId) filtro.colaboradorId = colaboradorId;

    if (diaSemana !== undefined) {
      const diaNum = parseInt(diaSemana);
      if (isNaN(diaNum) || diaNum < 0 || diaNum > 6) {
        return res.status(400).json({ message: "diaSemana inválido" });
      }
      filtro.diasSemana = diaNum;
    }

    // Busca horários
    const horarios = await Horario.find(filtro).sort({ horaInicio: 1 });

    // Retorna em formato legível
    const resultado = horarios.map((h) => ({
      id: h._id,
      colaboradorId: h.colaboradorId,
      diasSemana: h.diasSemana,
      horaInicio: h.horaInicio,
      horaFim: h.horaFim,
    }));

    return res.json({ horarios: resultado });
  } catch (err) {
    console.error("Erro ao buscar horários:", err);
    return res.status(500).json({ message: "Erro ao buscar horários" });
  }
});
/*
=====================================
ATUALIZAR HORÁRIO
=====================================
*/

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { salaoId, colaboradorId, diasSemana, horaInicio, horaFim } =
      req.body;

    /*
    =========================
    VALIDAÇÕES BÁSICAS
    =========================
    */

    if (!salaoId || !colaboradorId || !Array.isArray(diasSemana)) {
      return res.status(400).json({
        message: "Dados obrigatórios inválidos",
      });
    }

    const diasInvalidos = diasSemana.some((d) => d < 0 || d > 6);
    if (diasInvalidos) {
      return res.status(400).json({
        message: "Dias da semana inválidos",
      });
    }

    if (!validarHora(horaInicio) || !validarHora(horaFim)) {
      return res.status(400).json({
        message: "Formato de hora inválido (use HH:mm)",
      });
    }

    const inicio = toMinutes(horaInicio);
    const fim = toMinutes(horaFim);

    if (inicio >= fim) {
      return res.status(400).json({
        message: "Hora inicial deve ser menor que a final",
      });
    }

    /*
    =========================
    VERIFICA SE EXISTE
    =========================
    */

    const horarioExistente = await Horario.findById(id);

    if (!horarioExistente) {
      return res.status(404).json({ message: "Horário não encontrado" });
    }

    /*
    =========================
    VERIFICA SOBREPOSIÇÃO
    (ignora o próprio documento)
    =========================
    */

    const existentes = await Horario.find({
      _id: { $ne: id }, // exclui o próprio registro da verificação
      salaoId,
      colaboradorId,
      diasSemana: { $in: diasSemana },
    });

    for (const h of existentes) {
      const diasEmComum = h.diasSemana.filter((d) => diasSemana.includes(d));

      if (diasEmComum.length === 0) continue;

      const ei = toMinutes(h.horaInicio);
      const ef = toMinutes(h.horaFim);

      const conflito = inicio < ef && fim > ei;

      if (conflito) {
        return res.status(409).json({
          message: "Horário conflita com expediente existente",
        });
      }
    }

    /*
    =========================
    ATUALIZA HORÁRIO
    =========================
    */

    const horario = await Horario.findByIdAndUpdate(
      id,
      { salaoId, colaboradorId, diasSemana, horaInicio, horaFim },
      { new: true } // retorna o documento já atualizado
    );

    return res.json({ horario });
  } catch (err) {
    console.error("Erro ao atualizar horário:", err);
    return res.status(500).json({ message: "Erro ao atualizar horário" });
  }
});

/*
=====================================
DELETAR HORÁRIO
=====================================
*/

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const horario = await Horario.findById(id);

    if (!horario) {
      return res.status(404).json({ message: "Horário não encontrado" });
    }

    await Horario.findByIdAndDelete(id);

    return res.json({ message: "Horário deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar horário:", err);
    return res.status(500).json({ message: "Erro ao deletar horário" });
  }
});
module.exports = router;
