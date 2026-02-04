const mongoose = require('mongoose')
const Schema = mongoose.Schema

const agendamento = new Schema({
    servicoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servico',
        required: true,
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true,
    },
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
    dataAgendamento: {
        type: Date,
        required: true,
    },
   comissao: {
        type: Number,
        required: true,
    },
    valorServico: {
        type: Number,
        required: true,
    },
    transactionalId: {
        type: String,
        required: true,
    },
    dataVinculo: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Agendamento', agendamento)