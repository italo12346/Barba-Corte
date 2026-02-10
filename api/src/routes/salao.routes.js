const express = require('express')
const router = express.Router()
const Salao = require('../models/salao')

router.post('/', async (req, res) => {
    try{
        const salaoData = await new Salao(req.body).save()
        res.json({salaoData})
    }catch(err){
        res.status(500).send({message: 'Erro ao cadastrar salão', error: err})
    }
})

module.exports = router