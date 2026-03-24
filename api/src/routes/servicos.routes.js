const express = require('express')
const router = express.Router()
const Busboy = require('busboy')

const awsService = require('../services/aws')
const Servicos = require('../models/servico')
const Arquivos = require('../models/arquivo')

/* CRIAR SERVIÇO*/
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // valida ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: true,
        message: 'ID inválido'
      });
    }

    // atualiza serviço
    const servicoAtualizado = await Servicos.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // retorna o documento atualizado
    );

    if (!servicoAtualizado) {
      return res.status(404).json({
        error: true,
        message: 'Serviço não encontrado'
      });
    }

    res.json({
      error: false,
      message: 'Serviço atualizado com sucesso',
      servico: servicoAtualizado
    });

  } catch (err) {
    console.error('Erro ao atualizar serviço:', err);
    res.status(500).json({
      error: true,
      message: 'Erro interno ao atualizar serviço'
    });
  }
});
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


router.get('/servico/:salaoId', async (req, res) => {
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


router.post('/upload', async (req, res) => {
    try {
        if (!req.headers['content-type']?.includes('multipart/form-data')) {
            return res.status(400).json({
                error: true,
                message: 'Request precisa ser multipart/form-data'
            });
        }

        const busboy = Busboy({ headers: req.headers });

        const fields = {};
        const filePromises = [];

        busboy.on('field', (name, value) => {
            fields[name] = value;
        });

        busboy.on('file', (fieldname, file, info) => {
            const { filename, mimeType } = info;

            if (!filename) {
                file.resume();
                return;
            }

            const promise = new Promise((resolve, reject) => {
                const chunks = [];
                let tamanho = 0;

                file.on('data', chunk => {
                    chunks.push(chunk);
                    tamanho += chunk.length;
                });

                file.on('end', () => {
                    resolve({
                        filename,
                        mimeType,
                        buffer: Buffer.concat(chunks),
                        tamanho
                    });
                });

                file.on('error', reject);
            });

            filePromises.push(promise);
        });

        busboy.on('finish', async () => {
            try {

                if (!fields.salaoId)
                    return res.status(400).json({ error: true, message: 'salaoId obrigatório' });

                if (!fields.servico)
                    return res.status(400).json({ error: true, message: 'Campo servico obrigatório' });

                let servicoJson;

                try {
                    servicoJson = JSON.parse(fields.servico);
                } catch {
                    return res.status(400).json({
                        error: true,
                        message: 'JSON do serviço inválido'
                    });
                }

                servicoJson.salaoId = fields.salaoId;

                const files = await Promise.all(filePromises);

                let servico;

                /* =====================================================
                   MODO EDIÇÃO
                ======================================================*/
                if (fields.servicoId) {

                    if (!mongoose.Types.ObjectId.isValid(fields.servicoId)) {
                        return res.status(400).json({
                            error: true,
                            message: 'ID inválido'
                        });
                    }

                    servico = await Servicos.findByIdAndUpdate(
                        fields.servicoId,
                        servicoJson,
                        { new: true }
                    );

                    if (!servico) {
                        return res.status(404).json({
                            error: true,
                            message: 'Serviço não encontrado'
                        });
                    }

                    // 🔥 Remove imagens antigas APENAS se nova imagem foi enviada
                    if (files.length > 0) {
                        const arquivosAntigos = await Arquivos.find({
                            referenciaId: servico._id,
                            model: 'Servico'
                        });

                        for (const arquivo of arquivosAntigos) {
                            await awsService.deleteFromS3(arquivo.caminhoArquivo);
                            await arquivo.deleteOne();
                        }
                    }

                } 
                /* =====================================================
                   MODO CRIAÇÃO
                ======================================================*/
                else {
                    servico = await new Servicos(servicoJson).save();
                }

                const arquivosDocs = [];

                /* =====================================================
                   UPLOAD NOVAS IMAGENS
                ======================================================*/
                for (const f of files) {

                    const ext = f.filename.split('.').pop();

                    const key =
                        `servicos/${fields.salaoId}/${Date.now()}-${Math.random()
                            .toString(36)
                            .slice(2)}.${ext}`;

                    const upload =
                        await awsService.uploadBufferToS3(
                            f.buffer,
                            key,
                            f.mimeType
                        );

                    if (upload.error)
                        throw new Error(upload.message);

                    arquivosDocs.push({
                        referenciaId: servico._id,
                        model: 'Servico',
                        nome: f.filename,
                        descricao: null,
                        caminhoArquivo: `${process.env.S3_BUCKET}/${key}`,
                        tipoMime: f.mimeType,
                        tamanho: f.tamanho
                    });
                }

                if (arquivosDocs.length) {
                    await Arquivos.insertMany(arquivosDocs);
                }

                return res.status(fields.servicoId ? 200 : 201).json({
                    error: false,
                    message: fields.servicoId
                        ? 'Serviço atualizado com sucesso'
                        : 'Serviço criado com sucesso',
                    servico,
                    arquivos: arquivosDocs
                });

            } catch (err) {
                console.error('Erro no processamento:', err);
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }
        });

        req.pipe(busboy);

    } catch (err) {
        console.error('Erro geral:', err);
        res.status(500).json({
            error: true,
            message: 'Erro interno no upload'
        });
    }
});


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
