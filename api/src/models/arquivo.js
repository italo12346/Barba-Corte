const mongoose = require('mongoose');

const arquivoSchema = new mongoose.Schema({
    referenciaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'model'
    },
    model:{
        type: String,
        required: true,
        enum: ['Salao','Servico','Colaborador']
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    descricao: {
        type: String,
        trim: true
    },
    caminhoArquivo: {
        type: String,
        required: true
    },
    tipoMime: {
        type: String,
        required: false
    },
    tamanho: {
        type: Number,
        required: false
    },
},
{ timestamps: true }
);
module.exports = mongoose.model('Arquivo', arquivoSchema);