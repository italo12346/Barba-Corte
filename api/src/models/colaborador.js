const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ColaboradorSchema = new Schema({
    nome: {type: String, required: true},
    foto: {type: String, required: false},
    email: {type: String, required: true},
    senha: {type: String, required: true},
    telefone: {type: String, required: true},
    dataNascimento: {type: Date, required: true},
    sexo: {type: String, enum: ['M', 'F'], required: true},
    status: {type: String, enum: ['ATIVO', 'INATIVO'], default: 'ATIVO'},
    contaBancaria: {
        titular: {type: String, required: true},
        banco: {type: String, required: true},
        cpfCnpj: {type: String, required: true},
        agencia: {type: String, required: true},
        conta: {type: String, required: true},
        tipoConta: {type: String, enum: ['CORRENTE', 'POUPANCA'], required: true},
        dv: {type: String, required: true}
    },
    recipientId: {type: String, required: true},
    dataCadastro: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Colaborador', ColaboradorSchema)