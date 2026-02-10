const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema(
    {
        salaoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Salao',
            required: true,
        },
        titulo: {
            type: String,
            required: true,
            trim: true,
        },
        descricao: {
            type: String,
            trim: true,
        },
        preco: {
            type: Number,
            required: true,
            min: 0,
        },
        comissao: {
            type: Number,
            required: true,
            min: 0,
        },
        duracao: {
            type: Number,
            required: true,
            min: 1,
        },
        recorrencia: {
            type: String,
            enum: ['UNICO', 'SEMANAL', 'MENSAL'],
            default: 'UNICO',
        },
        status: {
            type: String,
            enum:['A','I','E'],
            default: 'A',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Servico', servicoSchema);