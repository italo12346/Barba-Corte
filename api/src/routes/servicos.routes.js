const express = require('express')
const router = express.Router()
const Busboy = require('busboy')

const awsService = require('../services/aws')
const Servicos = require('../models/servico')
const Arquivos = require('../models/arquivo')

/* CRIAR SERVIÇO*/
router.post('/', async (req, res) => {
    try {
        const servico = await new Servicos(req.body).save()
        res.json(servico)
    } catch (err) {
        res.status(500).json({
            message: 'Erro ao cadastrar serviço',
            error: err.message
        })
    }
})
// GET /servico/:servicoId
router.get('/:servicoId', async (req, res) => {
  try {
    const { servicoId } = req.params;

    // busca o serviço pelo ID
    const servico = await Servicos.findById(servicoId);

    if (!servico) {
      return res.status(404).json({
        error: true,
        message: 'Serviço não encontrado',
      });
    }

    // busca arquivos relacionados
    const arquivos = await Arquivos.find({
      model: 'Servico',
      referenciaId: servico._id,
    });

    res.json({
      error: false,
      servico: {
        ...servico.toObject(),
        arquivos,
      },
    });

  } catch (err) {
    console.error('Erro ao buscar serviço:', err);

    res.status(500).json({
      error: true,
      message: 'Erro ao buscar serviço',
    });
  }
});


router.get('/:salaoId', async (req, res) => {
    try {

        const { salaoId } = req.params;

        const servicos = await Servicos.find({
            salaoId,
            status: 'A'
        });

        const servicosSalao = [];

        for (const servico of servicos) {

            const arquivos = await Arquivos.find({
                model: 'Servico',
                referenciaId: servico._id
            });

            servicosSalao.push({
                ...servico.toObject(),
                arquivos
            });
        }

        res.json({
            error: false,
            total: servicosSalao.length,
            servicos: servicosSalao
        });

    } catch (err) {

        console.error('Erro ao buscar serviços:', err);

        res.status(500).json({
            error: true,
            message: 'Erro ao buscar serviços'
        });
    }
});


router.post('/upload', (req, res) => {

    if (!req.headers['content-type']?.includes('multipart/form-data')) {
        return res.status(400).json({
            erro: 'Request precisa ser multipart/form-data'
        })
    }

    const busboy = Busboy({ headers: req.headers })

    const fields = {}
    const filePromises = []

    console.log('\n=== NOVO UPLOAD ===')

    /* =========================
       CAMPOS TEXTO
    ==========================*/
    busboy.on('field', (name, value) => {
        console.log('FIELD:', name)
        fields[name] = value
    })

    /* =========================
       ARQUIVOS → BUFFER PROMISE
    ==========================*/
    busboy.on('file', (fieldname, file, info) => {

        const { filename, mimeType } = info

        console.log('FILE:', fieldname, filename, mimeType)

        if (!filename) {
            file.resume()
            return
        }

        const promise = new Promise((resolve, reject) => {

            const chunks = []
            let tamanho = 0

            file.on('data', chunk => {
                chunks.push(chunk)
                tamanho += chunk.length
            })

            file.on('end', () => {

                const buffer = Buffer.concat(chunks)

                console.log(`📦 Buffer pronto: ${tamanho} bytes`)

                resolve({
                    filename,
                    mimeType,
                    buffer,
                    tamanho
                })
            })

            file.on('error', reject)
        })

        filePromises.push(promise)
    })

    /* =========================
       FINALIZAÇÃO
    ==========================*/
    busboy.on('finish', async () => {

        try {

            console.log('FIELDS:', fields)

            const files = await Promise.all(filePromises)

            console.log('FILES:', files.length)

            if (!fields.salaoId)
                return res.status(400).json({ erro: 'salaoId obrigatório' })

            if (!fields.servico)
                return res.status(400).json({ erro: 'Campo servico obrigatório' })

            let servicoJson

            try {
                servicoJson = JSON.parse(fields.servico)
            } catch {
                return res.status(400).json({
                    erro: 'JSON do serviço inválido'
                })
            }

            servicoJson.salaoId = fields.salaoId

            console.log('💾 Salvando serviço...')
            const servico = await new Servicos(servicoJson).save()

            const arquivosDocs = []

            /* =========================
               UPLOAD S3 + MODEL
            ==========================*/
            for (const f of files) {

                const ext = f.filename.split('.').pop()

                const key =
                    `servicos/${fields.salaoId}/${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2)}.${ext}`

                console.log('☁️ Upload S3:', key)

                const upload =
                    await awsService.uploadBufferToS3(
                        f.buffer,
                        key,
                        f.mimeType
                    )

                if (upload.error)
                    throw new Error(upload.message)

                arquivosDocs.push({

                    referenciaId: servico._id,
                    model: 'Servico',

                    nome: f.filename,
                    descricao: null,

                    caminhoArquivo: key,
                    tipoMime: f.mimeType,
                    tamanho: f.tamanho
                })
            }

            if (arquivosDocs.length) {

                console.log('💾 Salvando arquivos...')
                await Arquivos.insertMany(arquivosDocs)
            }

            console.log('✅ Upload concluído')

            res.status(201).json({
                error: false,
                servico,
                arquivos: arquivosDocs
            })

        } catch (err) {

            console.error('🔥 ERRO FINAL:', err)

            res.status(500).json({
                error: true,
                message: err.message
            })
        }
    })

    req.pipe(busboy)
})

router.post('/remover-arquivo', async (req, res) => {
    try {
        const { id } = req.body;

        // validação básica
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'ID do arquivo inválido'
            });
        }

        // verifica se existe no banco
        const arquivo = await Arquivos.findOne({
            caminhoArquivo: id
        });

        if (!arquivo) {
            return res.status(404).json({
                error: true,
                message: 'Arquivo não encontrado'
            });
        }

        // remove do S3
        const s3Result = await awsService.deleteFromS3(id);

        if (s3Result?.error) {
            return res.status(500).json({
                error: true,
                message: 'Falha ao remover do S3'
            });
        }

        // remove do banco
        await arquivo.deleteOne();

        res.json({
            error: false,
            message: 'Arquivo removido com sucesso'
        });

    } catch (err) {
        console.error('Erro ao remover arquivo:', err);

        res.status(500).json({
            error: true,
            message: 'Erro interno ao remover arquivo'
        });
    }
});

const mongoose = require('mongoose');

router.delete('/:id', async (req, res) => {
    try {

        const { id } = req.params;

        // valida ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID inválido'
            });
        }

        // soft delete
        const servico = await Servicos.findByIdAndUpdate(
            id,
            { status: 'E' },
            { new: true }
        );

        if (!servico) {
            return res.status(404).json({
                error: true,
                message: 'Serviço não encontrado'
            });
        }

        res.json({
            error: false,
            message: 'Serviço removido com sucesso',
            servico
        });

    } catch (err) {

        console.error('Erro ao remover serviço:', err);

        res.status(500).json({
            error: true,
            message: 'Erro ao remover serviço'
        });
    }
});

module.exports = router
