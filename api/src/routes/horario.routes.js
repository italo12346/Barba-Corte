const express = require('express')
const router = express.Router()
const Horario = require('../models/Horario')

router.post('/', async (req, res) => {
  try {
    const {
      salaoId,
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim
    } = req.body

    if (!salaoId || !colaboradorId || !diasSemana?.length) {
      return res.status(400).json({ message: 'Dados obrigatórios ausentes' })
    }

    if (horaInicio >= horaFim) {
      return res.status(400).json({
        message: 'Hora inicial deve ser menor que a final'
      })
    }

    const horarioExistente = await Horario.findOne({
      salaoId,
      colaboradorId,
      diasSemana: { $in: diasSemana },
      horaInicio,
      horaFim
    })

    if (horarioExistente) {
      return res.status(409).json({ message: 'Horário já cadastrado' })
    }

    const horario = await Horario.create({
      salaoId,
      colaboradorId,
      diasSemana,
      horaInicio,
      horaFim
    })

    return res.status(201).json({ horario })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Erro ao cadastrar horário'
    })
  }
})


module.exports = router