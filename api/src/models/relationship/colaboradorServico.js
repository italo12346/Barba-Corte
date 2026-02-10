const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ColaboradorServico = new Schema({
    servicoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servico',
        required: true,
    },
    colaboradorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colaborador',
        required: true,
    },
    status: {type: String, enum: ['ATIVO', 'INATIVO'], default: 'ATIVO'},
    dataVinculo: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('ColaboradorServico', ColaboradorServico)