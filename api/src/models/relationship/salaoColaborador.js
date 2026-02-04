const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalaoColaborador = new Schema({
    salaoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salao',
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


module.exports = mongoose.model('SalaoColaborador', SalaoColaborador)