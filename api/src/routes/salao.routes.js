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


router.post("/upload", async (req, res) => {
  try {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return res.status(400).json({
        error: true,
        message: "Request precisa ser multipart/form-data",
      });
    }

    const busboy = Busboy({ headers: req.headers });

    const filePromises = [];

    /* =========================================
       CAPTURA DOS ARQUIVOS
    ========================================= */
    busboy.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!filename) {
        file.resume();
        return;
      }

      const promise = new Promise((resolve, reject) => {
        const chunks = [];
        let tamanho = 0;

        file.on("data", (chunk) => {
          chunks.push(chunk);
          tamanho += chunk.length;
        });

        file.on("end", () => {
          resolve({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks),
            tamanho,
            fieldname, // 🔥 foto | capa
          });
        });

        file.on("error", reject);
      });

      filePromises.push(promise);
    });

    /* =========================================
       FINALIZAÇÃO
    ========================================= */
    busboy.on("finish", async () => {
      try {
        const salaoId = req.salaoId; 
        console.log(salaoId);
        
        const files = await Promise.all(filePromises);

        if (!files.length) {
          return res.status(400).json({
            error: true,
            message: "Nenhum arquivo enviado",
          });
        }

        const salaoDoc = await Salao.findById(salaoId);

        if (!salaoDoc) {
          return res.status(404).json({
            error: true,
            message: "Salão não encontrado",
          });
        }

        /* =========================================
           REMOVE ARQUIVOS ANTIGOS
        ========================================= */
        const arquivosAntigos = await Arquivos.find({
          referenciaId: salaoId,
          model: "Salao",
        });

        for (const arquivo of arquivosAntigos) {
          await awsService.deleteFromS3(arquivo.caminhoArquivo);
          await arquivo.deleteOne();
        }

        /* =========================================
           UPLOAD PARA S3
        ========================================= */
        const arquivosDocs = [];
        const updateData = {};

        for (const f of files) {
          const ext = f.filename.split(".").pop();

          const key = `saloes/${salaoId}/${f.fieldname}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.${ext}`;

          const upload = await awsService.uploadBufferToS3(
            f.buffer,
            key,
            f.mimeType
          );

          if (upload.error) {
            throw new Error(upload.message);
          }

          const url = `${process.env.S3_BUCKET}/${key}`;

          arquivosDocs.push({
            referenciaId: salaoId,
            model: "Salao",
            nome: f.filename,
            descricao: f.fieldname, // 🔥 foto | capa
            caminhoArquivo: url,
            tipoMime: f.mimeType,
            tamanho: f.tamanho,
          });

          // 🔥 atualiza dinamicamente
          if (f.fieldname === "foto") {
            updateData.foto = url;
          }

          if (f.fieldname === "capa") {
            updateData.capa = url;
          }
        }

        await Arquivos.insertMany(arquivosDocs);

        /* =========================================
           ATUALIZA SALÃO
        ========================================= */
        await Salao.findByIdAndUpdate(salaoId, updateData);

        return res.status(200).json({
          error: false,
          message: "Upload realizado com sucesso",
          ...updateData, // 🔥 retorna foto e/ou capa direto
        });

      } catch (err) {
        console.error("Erro no upload salão:", err);
        return res.status(500).json({
          error: true,
          message: err.message,
        });
      }
    });

    req.pipe(busboy);

  } catch (err) {
    console.error("Erro geral upload salão:", err);
    res.status(500).json({
      error: true,
      message: "Erro interno no upload",
    });
  }
});
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
