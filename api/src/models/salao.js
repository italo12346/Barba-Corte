const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SalaoSchema = new Schema({
    nome: {type: String, required: true},
    foto: {type: String, required: false},
    capa: {type: String, required: false},
    email: {type: String, required: true},
    telefone: {type: String, required: true},
    endereco: {
        cidade:String,
        uf:String,
        cep:String,
        numero:String,
        pais:String,
    },
    geo: {
        type: {type: String, default: 'Point'},
        coordinates: {type: [Number]}
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
})

SalaoSchema.index({geo: '2dsphere'})
module.exports = mongoose.model('Salao', SalaoSchema)