const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const mongoose = require('mongoose');

const awsService = require('../services/aws');
const Servicos = require('../models/servico');
const Arquivos = require('../models/arquivo');

/* ======================================
   LISTAR SERVIÇOS DO SALÃO
   IMPORTANTE: deve vir ANTES de /:servicoId
   para o Express não interpretar "servico"
   como um parâmetro de rota dinâmico.
====================================== */

/* ======================================
   LISTAR SERVIÇOS DO SALÃO
   IMPORTANTE: deve vir ANTES de /:servicoId
   para o Express não interpretar "servico"
   como um parâmetro de rota dinâmico.
====================================== */
router.get('/servico', async (req, res) => {
  try {
    const salaoId = req.salaoId;

    const servicos = await Servicos.find({
      salaoId,
      status: 'A'
    });

    const resultado = [];

    for (const servico of servicos) {
      const arquivos = await Arquivos.find({
        model: 'Servico',
        referenciaId: servico._id
      });

      resultado.push({
        ...servico.toObject(),
        arquivos
      });
    }

    res.json({
      error: false,
      total: resultado.length,
      servicos: resultado
    });

  } catch (err) {
    res.status(500).json({ error: true, message: 'Erro ao buscar serviços' });
  }
});

router.get('/servico/:salaoId', async (req, res) => {
  try {
    const { salaoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
      return res.status(400).json({ error: true, message: 'ID do salão inválido' });
    }

    const servicos = await Servicos.find({
      salaoId,
      status: 'A'
    });

    const resultado = [];

    for (const servico of servicos) {
      const arquivos = await Arquivos.find({
        model: 'Servico',
        referenciaId: servico._id
      });

      resultado.push({
        ...servico.toObject(),
        arquivos
      });
    }

    res.json({
      error: false,
      total: resultado.length,
      servicos: resultado
    });

  } catch (err) {
    console.error("Erro ao buscar serviços:", err);
    res.status(500).json({ error: true, message: 'Erro ao buscar serviços' });
  }
});


/* ======================================
   CREATE / UPDATE COM UPLOAD
   IMPORTANTE: deve vir ANTES de /:servicoId
   para o Express não interpretar "upload"
   como um parâmetro de rota dinâmico.
====================================== */
router.post('/upload', async (req, res) => {
  try {
    const salaoId = req.salaoId;

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

        file.on('data', chunk => chunks.push(chunk));
        file.on('end', () => {
          resolve({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks)
          });
        });

        file.on('error', reject);
      });

      filePromises.push(promise);
    });

    busboy.on('finish', async () => {
      try {

        if (!fields.servico) {
          return res.status(400).json({
            error: true,
            message: 'Campo servico obrigatório'
          });
        }

        let servicoJson = JSON.parse(fields.servico);
        servicoJson.salaoId = salaoId;

        const files = await Promise.all(filePromises);

        let servico;

        /* =========================
           UPDATE
        ========================= */
        if (fields.servicoId) {

          servico = await Servicos.findOneAndUpdate(
            { _id: fields.servicoId, salaoId },
            servicoJson,
            { new: true }
          );

          if (!servico) {
            return res.status(404).json({
              error: true,
              message: 'Serviço não encontrado'
            });
          }

          if (files.length > 0) {
            const antigos = await Arquivos.find({
              referenciaId: servico._id,
              model: 'Servico'
            });

            for (const a of antigos) {
              await awsService.deleteFromS3(a.caminhoArquivo);
              await a.deleteOne();
            }
          }

        }
        /* =========================
           CREATE
        ========================= */
        else {
          servico = await Servicos.create(servicoJson);
        }

        const arquivosDocs = [];

        for (const f of files) {
          const ext = f.filename.split('.').pop();

          const key = `servicos/${salaoId}/${Date.now()}.${ext}`;

          await awsService.uploadBufferToS3(
            f.buffer,
            key,
            f.mimeType
          );

          arquivosDocs.push({
            referenciaId: servico._id,
            model: 'Servico',
            nome: f.filename,
            caminhoArquivo: `${process.env.S3_BUCKET}/${key}`,
          });
        }

        if (arquivosDocs.length) {
          await Arquivos.insertMany(arquivosDocs);
        }

        res.json({
          error: false,
          servico,
          arquivos: arquivosDocs
        });

      } catch (err) {
        res.status(500).json({ error: true, message: err.message });
      }
    });

    req.pipe(busboy);

  } catch (err) {
    res.status(500).json({ error: true, message: 'Erro no upload' });
  }
});

/* ======================================
   GET SERVIÇO POR ID
====================================== */
router.get('/:servicoId', async (req, res) => {
  try {
    const { servicoId } = req.params;
    const salaoId = req.salaoId;

    if (!mongoose.Types.ObjectId.isValid(servicoId)) {
      return res.status(400).json({ error: true, message: 'ID inválido' });
    }

    const servico = await Servicos.findOne({
      _id: servicoId,
      salaoId
    });

    if (!servico) {
      return res.status(404).json({ error: true, message: 'Serviço não encontrado' });
    }

    const arquivos = await Arquivos.find({
      model: 'Servico',
      referenciaId: servico._id
    });

    res.json({
      error: false,
      servico: {
        ...servico.toObject(),
        arquivos
      }
    });

  } catch (err) {
    res.status(500).json({ error: true, message: 'Erro ao buscar serviço' });
  }
});

/* ======================================
   UPDATE SERVIÇO
====================================== */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const salaoId = req.salaoId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: 'ID inválido' });
    }

    const servico = await Servicos.findOneAndUpdate(
      { _id: id, salaoId },
      req.body,
      { new: true }
    );

    if (!servico) {
      return res.status(404).json({ error: true, message: 'Serviço não encontrado' });
    }

    res.json({
      error: false,
      message: 'Serviço atualizado com sucesso',
      servico
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Erro interno' });
  }
});

/* ======================================
   DELETE (SOFT DELETE)
====================================== */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const salaoId = req.salaoId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: true, message: 'ID inválido' });
    }

    const servico = await Servicos.findOneAndUpdate(
      { _id: id, salaoId },
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
      message: 'Serviço removido com sucesso'
    });

  } catch (err) {
    res.status(500).json({
      error: true,
      message: 'Erro ao remover serviço'
    });
  }
});

module.exports = router;