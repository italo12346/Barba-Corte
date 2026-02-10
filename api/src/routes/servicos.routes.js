const express = require('express')
const router = express.Router()
const Servicos = require('../models/servico')

router.get('/:salaoId', async (req, res) => {
    try{
        const { salaoId } = req.params
        const servicos = await Servicos.find({salaoId, status:'A'}) .select('_id titulo')
        res.json({servicos: servicos.map(s => ({id: s._id, titulo: s.titulo}))})
    }catch(err){
        res.status(500).send({message: 'Erro ao buscar serviços', error: err})
    }
        res.json(servicos)
    })
module.exports = router