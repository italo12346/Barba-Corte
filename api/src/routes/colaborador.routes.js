const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");

const router = express.Router();

const Colaborador = require("../models/colaborador");
const SalaoColaborador = require("../models/relationship/salaoColaborador");
const ColaboradorServico = require("../models/relationship/colaboradorServico");

const Busboy = require("busboy");
const Arquivos = require("../models/arquivo");
const awsService = require("../services/aws");


/*
========================================
CRIAR COLABORADOR + VÍNCULO + SERVIÇOS
========================================
*/
router.post("/", async (req, res) => {
  console.log("======================================");
  console.log("🚀 INICIANDO CRIAÇÃO DE COLABORADOR");
  console.log("BODY:", JSON.stringify(req.body, null, 2));

  const db = mongoose.connection;
  const session = await db.startSession();

  try {
    await session.startTransaction();

    const { colaborador } = req.body;
    const salaoId = req.salaoId;

    if (!colaborador || !salaoId) {
      throw new Error("Dados inválidos: colaborador ou salaoId ausente");
    }

    console.log("🔍 Verificando se colaborador já existe...");

    const existentColaborador = await Colaborador.findOne({
      $or: [
        { email: colaborador.email },
        { telefone: colaborador.telefone },
      ],
    });

    let colaboradorId;

    if (!existentColaborador) {
      console.log("🆕 Criando novo colaborador...");

      const newColaborador = await new Colaborador({
        ...colaborador,
      }).save({ session });

      colaboradorId = newColaborador._id;

      console.log("✅ Colaborador criado:", colaboradorId);
    } else {
      colaboradorId = existentColaborador._id;
      console.log("⚠️ Colaborador já existia:", colaboradorId);
    }

    console.log("🔗 Verificando vínculo com salão...");

    const existentRelationship = await SalaoColaborador.findOne({
      salaoId,
      colaboradorId,
    });

    if (!existentRelationship) {
      console.log("🔗 Criando vínculo com salão...");

      await new SalaoColaborador({
        salaoId,
        colaboradorId,
        status: colaborador.vinculo || "A",
      }).save({ session });

      console.log("✅ Vínculo criado");
    } else if (existentRelationship.status === "I") {
      console.log("♻️ Reativando vínculo existente...");

      await SalaoColaborador.findOneAndUpdate(
        { salaoId, colaboradorId },
        { status: "A" },
        { session }
      );
    }

    if (colaborador.especialidades?.length) {
      console.log("🛠 Inserindo especialidades...");

      await ColaboradorServico.insertMany(
        colaborador.especialidades.map((servicoId) => ({
          servicoId,
          colaboradorId,
        })),
        { session }
      );

      console.log("✅ Especialidades inseridas");
    }

    await session.commitTransaction();
    session.endSession();

    console.log("🎉 TRANSACTION COMMITADA COM SUCESSO");
    console.log("======================================");

    res.status(201).json({
      error: false,
      message: "Colaborador processado com sucesso",
      colaboradorId,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("💥 ERRO NA TRANSACTION:");
    console.error(err);

    res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});

/*
====================
FILTRAR COLABORADOR
====================
*/
router.post("/filter", async (req, res) => {
  try {
    const colaboradores = await Colaborador.find(req.body.filters);

    res.json({
      error: false,
      colaboradores,
    });

  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/*
========================
LISTAR POR SALÃO
========================
*/
router.get("/salao/", async (req, res) => {
  try {
    const salaoId = req.salaoId;

    // Busca vínculos ativos
    const vinculos = await SalaoColaborador.find({
      salaoId,
      status: { $ne: "E" },
    })
      .populate("colaboradorId")
      .select("colaboradorId dataCadastro status")
      .lean(); // <- importante para evitar uso de _doc

    const listaColaboradores = [];

    for (let vinculo of vinculos) {
      // 🔥 PROTEÇÃO CONTRA COLABORADOR NULO
      if (!vinculo.colaboradorId) {
        console.warn("⚠️ Vínculo com colaborador inexistente:", vinculo._id);
        continue;
      }

      const especialidades = await ColaboradorServico.find({
        colaboradorId: vinculo.colaboradorId._id,
      }).lean();

      listaColaboradores.push({
        ...vinculo.colaboradorId,
        vinculoId: vinculo._id,
        vinculo: vinculo.status,
        especialidades: especialidades.map((e) => e.servicoId),
        dataCadastro: moment(vinculo.dataCadastro).format("DD/MM/YYYY"),
      });
    }

    return res.json({
      error: false,
      colaboradores: listaColaboradores,
    });

  } catch (err) {
    console.error("💥 ERRO AO LISTAR COLABORADORES:", err);

    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
});


/*
====================
ATUALIZAR
====================
*/
router.put("/:colaboradorId", async (req, res) => {
  try {
    const { vinculo, vinculoId, especialidades, ...colaboradorData } = req.body;
    const { colaboradorId } = req.params;

    // Atualiza apenas os campos do colaborador
    await Colaborador.findByIdAndUpdate(colaboradorId, colaboradorData, { new: true });

    // Atualiza vínculo somente se existir
    if (vinculo && vinculoId) {
      await SalaoColaborador.findByIdAndUpdate(vinculoId, {
        status: vinculo,
      });
    }

    // Atualiza especialidades
    if (Array.isArray(especialidades)) {
      await ColaboradorServico.deleteMany({ colaboradorId });

      if (especialidades.length > 0) {
        await ColaboradorServico.insertMany(
          especialidades.map((servicoId) => ({
            servicoId,
            colaboradorId,
          }))
        );
      }
    }

    res.json({ error: false });

  } catch (err) {
    console.error("Erro no PUT /colaborador/:id", err);
    res.status(500).json({ error: true, message: err.message });
  }
});

/*
====================
REMOVER VÍNCULO
====================
*/
router.delete("/vinculo/:id", async (req, res) => {
  try {
    await SalaoColaborador.findByIdAndUpdate(req.params.id, {
      status: "E",
    });

    res.json({ error: false });

  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/*
========================================
UPLOAD FOTO COLABORADOR
========================================
*/
/*
========================================
UPLOAD FOTO COLABORADOR (CREATE + UPDATE)
========================================
*/
router.post("/upload", async (req, res) => {
  try {
    if (!req.headers["content-type"]?.includes("multipart/form-data")) {
      return res.status(400).json({
        error: true,
        message: "Request precisa ser multipart/form-data",
      });
    }

    const busboy = Busboy({ headers: req.headers });

    const fields = {};
    const filePromises = [];

    /* =========================================
       CAPTURA DOS CAMPOS
    ========================================= */
    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    /* =========================================
       CAPTURA DO ARQUIVO
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
          });
        });

        file.on("error", reject);
      });

      filePromises.push(promise);
    });

    /* =========================================
       FINALIZAÇÃO DO UPLOAD
    ========================================= */
    busboy.on("finish", async () => {
      try {
        const { colaboradorId, colaborador, salaoId } = fields;

        const files = await Promise.all(filePromises);

        if (!files.length) {
          return res.status(400).json({
            error: true,
            message: "Nenhum arquivo enviado",
          });
        }

        let colaboradorDoc;

        /* =========================================
           CREATE
        ========================================= */
        if (!colaboradorId) {
          if (!colaborador || !salaoId) {
            return res.status(400).json({
              error: true,
              message: "Dados insuficientes para criação",
            });
          }

          const colaboradorData = JSON.parse(colaborador);

          colaboradorDoc = await Colaborador.create({
            ...colaboradorData,
          });

          await SalaoColaborador.create({
            salaoId,
            colaboradorId: colaboradorDoc._id,
            status: colaboradorData.vinculo || "A",
          });

          if (colaboradorData.especialidades?.length) {
            await ColaboradorServico.insertMany(
              colaboradorData.especialidades.map((servicoId) => ({
                servicoId,
                colaboradorId: colaboradorDoc._id,
              }))
            );
          }
        }

        /* =========================================
           UPDATE
        ========================================= */
        else {
          if (!mongoose.Types.ObjectId.isValid(colaboradorId)) {
            return res.status(400).json({
              error: true,
              message: "ID inválido",
            });
          }

          colaboradorDoc = await Colaborador.findById(colaboradorId);

          if (!colaboradorDoc) {
            return res.status(404).json({
              error: true,
              message: "Colaborador não encontrado",
            });
          }
        }

        /* =========================================
           REMOVE FOTO ANTIGA
        ========================================= */
        const arquivosAntigos = await Arquivos.find({
          referenciaId: colaboradorDoc._id,
          model: "Colaborador",
        });

        for (const arquivo of arquivosAntigos) {
          await awsService.deleteFromS3(arquivo.caminhoArquivo);
          await arquivo.deleteOne();
        }

        /* =========================================
           UPLOAD PARA S3
        ========================================= */
        const arquivosDocs = [];

        for (const f of files) {
          const ext = f.filename.split(".").pop();

          const key = `colaboradores/${colaboradorDoc._id}/${Date.now()}-${Math.random()
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

          arquivosDocs.push({
            referenciaId: colaboradorDoc._id,
            model: "Colaborador",
            nome: f.filename,
            descricao: null,
            caminhoArquivo: `${process.env.S3_BUCKET}/${key}`,
            tipoMime: f.mimeType,
            tamanho: f.tamanho,
          });
        }

        await Arquivos.insertMany(arquivosDocs);

        /* =========================================
           ATUALIZA CAMPO FOTO NO COLABORADOR
        ========================================= */
        await Colaborador.findByIdAndUpdate(colaboradorDoc._id, {
          foto: arquivosDocs[0].caminhoArquivo,
        });

        return res.status(200).json({
          error: false,
          message: "Upload realizado com sucesso",
          colaboradorId: colaboradorDoc._id,
          foto: arquivosDocs[0].caminhoArquivo,
        });

      } catch (err) {
        console.error("Erro no upload colaborador:", err);
        return res.status(500).json({
          error: true,
          message: err.message,
        });
      }
    });

    req.pipe(busboy);

  } catch (err) {
    console.error("Erro geral upload colaborador:", err);
    res.status(500).json({
      error: true,
      message: "Erro interno no upload",
    });
  }
});

module.exports = router;
