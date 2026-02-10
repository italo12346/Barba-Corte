const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalaoCliente = new Schema({
    salaoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salao',
        required: true,
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true,
    },
    status: {type: String, enum: ['ATIVO', 'INATIVO'], default: 'ATIVO'},
    dataVinculo: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('SalaoCliente', SalaoCliente)