const express = require("express");
const mongoose = require("mongoose");
const Busboy = require("busboy");

const router = express.Router();

const awsService = require("../services/aws");
const Salao = require("../models/salao");
const Servicos = require("../models/servico");
const Arquivos = require("../models/arquivo");

/* ===============================
   CRIAR SALÃO
=============================== */

router.post("/", async (req, res) => {
  try {

    const salao = await new Salao(req.body).save();

    res.status(201).json({
      error: false,
      salao
    });

  } catch (err) {

    console.error("Erro ao cadastrar salão:", err);

    res.status(500).json({
      error: true,
      message: "Erro ao cadastrar salão"
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

    busboy.on('field', (name, value) => {
        fields[name] = value
    })

    busboy.on('file', (fieldname, file, info) => {

        const { filename, mimeType } = info

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
                resolve({
                    filename,
                    mimeType,
                    buffer: Buffer.concat(chunks),
                    tamanho,
                    fieldname // foto | capa
                })
            })

            file.on('error', reject)
        })

        filePromises.push(promise)
    })

    busboy.on('finish', async () => {

        try {

            const files = await Promise.all(filePromises)

            if (!fields.salaoId)
                return res.status(400).json({ erro: 'salaoId obrigatório' })

            const arquivosDocs = []

            for (const f of files) {

                const ext = f.filename.split('.').pop()

                const key =
                    `saloes/${fields.salaoId}/${f.fieldname}-${Date.now()}.${ext}`

                const upload =
                    await awsService.uploadBufferToS3(
                        f.buffer,
                        key,
                        f.mimeType
                    )

                if (upload.error)
                    throw new Error(upload.message)

                arquivosDocs.push({
                    referenciaId: fields.salaoId,
                    model: 'Salao',
                    nome: f.filename,
                    descricao: f.fieldname, // foto | capa
                    caminhoArquivo: key,
                    tipoMime: f.mimeType,
                    tamanho: f.tamanho
                })
            }

            if (arquivosDocs.length) {
                await Arquivos.insertMany(arquivosDocs)
            }

            res.status(201).json({
                error: false,
                arquivos: arquivosDocs
            })

        } catch (err) {
            console.error(err)
            res.status(500).json({
                error: true,
                message: err.message
            })
        }
    })

    req.pipe(busboy)
})


/* ===============================
   LISTAR SERVIÇOS DO SALÃO
=============================== */

router.get("/servico/:salaoId", async (req, res) => {
  try {

    const { salaoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
      return res.status(400).json({
        error: true,
        message: "ID do salão inválido"
      });
    }

    const servicos = await Servicos.find({
      salaoId,
      status: "A"
    }).select("_id titulo");

    res.json({
      error: false,
      total: servicos.length,
      servicos: servicos.map(s => ({
        id: s._id,
        titulo: s.titulo
      }))
    });

  } catch (err) {

    console.error("Erro ao buscar serviços:", err);

    res.status(500).json({
      error: true,
      message: "Erro ao buscar serviços"
    });
  }
});

/* ===============================
   BUSCAR SALÃO POR ID
=============================== */

router.get("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: true,
        message: "ID inválido"
      });
    }

    const salao = await Salao.findById(id)
      .select("nome capa endereco.cidade");

    if (!salao) {
      return res.status(404).json({
        error: true,
        message: "Salão não encontrado"
      });
    }

    res.json({
      error: false,
      salao: {
        id: salao._id,
        nome: salao.nome,
        cidade: salao.endereco?.cidade || null,
        capa: salao.capa
      }
    });

  } catch (err) {

    console.error("Erro ao buscar salão:", err);

    res.status(500).json({
      error: true,
      message: "Erro ao buscar salão"
    });
  }
});

module.exports = router;
