const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');

const Horario = require('../models/horario');

const TZ = 'America/Sao_Paulo';

/*
=====================================
UTILS
=====================================
*/

// valida HH:mm (strict parsing)
function validarHora(hhmm) {
  if (typeof hhmm !== 'string') return false;
  return moment(hhmm, 'HH:mm', true).isValid();
}

// converte HH:mm → minutos do dia com timezone fixo
function toMinutes(hhmm) {
  const m = moment.tz(hhmm, 'HH:mm', TZ);
  return m.hours() * 60 + m.minutes();
}


/*
=====================================
CRIAR HORÁRIO
=====================================
*/

router.post('/', async (req, res) => {
  try {
    const {
      salaoId,
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim
    } = req.body;

    /*
    =========================
    VALIDAÇÕES BÁSICAS
    =========================
    */

    if (!salaoId || !colaboradorId || !Array.isArray(diasSemana)) {
      return res.status(400).json({
        message: 'Dados obrigatórios inválidos'
      });
    }

    // valida dias da semana
    const diasInvalidos = diasSemana.some(d => d < 0 || d > 6);
    if (diasInvalidos) {
      return res.status(400).json({
        message: 'Dias da semana inválidos'
      });
    }

    // valida formato hora
    if (!validarHora(horaInicio) || !validarHora(horaFim)) {
      return res.status(400).json({
        message: 'Formato de hora inválido (use HH:mm)'
      });
    }

    const inicio = toMinutes(horaInicio);
    const fim = toMinutes(horaFim);

    if (inicio >= fim) {
      return res.status(400).json({
        message: 'Hora inicial deve ser menor que a final'
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
      diasSemana: { $in: diasSemana }
    });

    for (const h of existentes) {
      const ei = toMinutes(h.horaInicio);
      const ef = toMinutes(h.horaFim);

      const conflito = inicio < ef && fim > ei;

      if (conflito) {
        return res.status(409).json({
          message: 'Horário conflita com expediente existente'
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
      timezone: TZ // opcional — ajuda auditoria futura
    });

    return res.status(201).json({ horario });

  } catch (err) {
    console.error('Erro horário:', err);

    return res.status(500).json({
      message: 'Erro ao cadastrar horário'
    });
  }
});

module.exports = router;
