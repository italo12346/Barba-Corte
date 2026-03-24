const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");

const router = express.Router();

const Cliente = require("../models/cliente");
const SalaoCliente = require("../models/relationship/salaoCliente");

const Busboy = require("busboy");
const Arquivos = require("../models/arquivo");
const awsService = require("../services/aws");

/*
========================================
CRIAR / VINCULAR CLIENTE
========================================
*/
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { cliente, salaoId } = req.body;

    if (!cliente || !salaoId) {
      throw new Error("Dados incompletos");
    }

    let existentClient = await Cliente.findOne({
      $or: [{ email: cliente.email }, { telefone: cliente.telefone }],
    }).session(session);

    let clienteId;

    if (!existentClient) {
      const novoCliente = await new Cliente({
        ...cliente,
        mercadoPago: { customerId: null },
      }).save({ session });

      clienteId = novoCliente._id;
    } else {
      clienteId = existentClient._id;
    }

    let vinculo = await SalaoCliente.findOne({
      salaoId,
      clienteId,
    }).session(session);

    if (!vinculo) {
      await new SalaoCliente({
        salaoId,
        clienteId,
        status: "A",
      }).save({ session });
    } else if (vinculo.status === "I") {
      vinculo.status = "A";
      await vinculo.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      error: false,
      clienteId,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

/*
========================================
FILTRAR CLIENTES
========================================
*/
router.post("/filter", async (req, res) => {
  try {
    const clientes = await Cliente.find(req.body.filters || {});

    res.json({
      error: false,
      clientes,
    });

  } catch (err) {
    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

/*
========================================
LISTAR CLIENTES DO SALÃO
========================================
*/
router.get("/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;

    const clientes = await SalaoCliente.find({
      salaoId,
      status: "A",
    })
      .populate("clienteId")
      .select("clienteId dataCadastro");

    const resultado = clientes
      .filter((c) => c.clienteId)
      .map((c) => ({
        ...c.clienteId.toObject(),
        vinculoId: c._id,
        dataCadastro: moment(c.dataCadastro).format("DD/MM/YYYY"),
      }));

    res.json({
      error: false,
      clientes: resultado,
    });

  } catch (err) {
    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

/*
========================================
INATIVAR VÍNCULO
========================================
*/
router.delete("/vinculo/:id", async (req, res) => {
  try {
    const vinculo = await SalaoCliente.findById(req.params.id);

    if (!vinculo) {
      throw new Error("Vínculo não encontrado");
    }

    vinculo.status = "I";
    await vinculo.save();

    res.json({ error: false });

  } catch (err) {
    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

/*
========================================
UPLOAD FOTO CLIENTE (CREATE + UPDATE)
========================================
*/
/*
========================================
UPLOAD FOTO CLIENTE (CREATE + UPDATE)
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

    /*
    ========================================
    CAMPOS
    ========================================
    */
    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    /*
    ========================================
    FILES
    ========================================
    */
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

    /*
    ========================================
    FINALIZAÇÃO
    ========================================
    */
    busboy.on("finish", async () => {

      try {

        let { clienteId, cliente, salaoId } = fields;

        console.log("FIELDS:", fields);

        if (typeof cliente === "string") {
          cliente = JSON.parse(cliente);
        }

        const files = await Promise.all(filePromises);

        let clienteDoc;

        /*
        ========================================
        CREATE
        ========================================
        */
        if (!clienteId) {

          if (!cliente || !salaoId) {
            throw new Error("Dados insuficientes para criação");
          }

          clienteDoc = await Cliente.create({
            ...cliente,
            mercadoPago: { customerId: null },
          });

          await SalaoCliente.create({
            salaoId,
            clienteId: clienteDoc._id,
            status: "A",
          });

        }

        /*
        ========================================
        UPDATE
        ========================================
        */
        else {

          if (!mongoose.Types.ObjectId.isValid(clienteId)) {
            throw new Error("ID inválido");
          }

          clienteDoc = await Cliente.findByIdAndUpdate(
            clienteId,
            cliente,
            { new: true }
          );

          if (!clienteDoc) {
            throw new Error("Cliente não encontrado");
          }

        }

        /*
        ========================================
        SE NÃO VEIO FOTO → SÓ ATUALIZA
        ========================================
        */
        if (!files.length) {

          return res.status(200).json({
            error: false,
            message: "Cliente salvo sem alterar foto",
            clienteId: clienteDoc._id,
            foto: clienteDoc.foto || null,
          });

        }

        /*
        ========================================
        REMOVE FOTO ANTIGA
        ========================================
        */
        const arquivosAntigos = await Arquivos.find({
          referenciaId: clienteDoc._id,
          model: "Cliente",
        });

        for (const arquivo of arquivosAntigos) {

          await awsService.deleteFromS3(arquivo.caminhoArquivo);
          await arquivo.deleteOne();

        }

        /*
        ========================================
        UPLOAD S3
        ========================================
        */
        const arquivosDocs = [];

        for (const f of files) {

          const ext = f.filename.split(".").pop();

          const key = `clientes/${clienteDoc._id}/${Date.now()}-${Math.random()
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
            referenciaId: clienteDoc._id,
            model: "Cliente",
            nome: f.filename,
            descricao: null,
            caminhoArquivo: `${process.env.S3_BUCKET}/${key}`,
            tipoMime: f.mimeType,
            tamanho: f.tamanho,
          });

        }

        await Arquivos.insertMany(arquivosDocs);

        /*
        ========================================
        ATUALIZA FOTO
        ========================================
        */
        await Cliente.findByIdAndUpdate(clienteDoc._id, {
          foto: arquivosDocs[0].caminhoArquivo,
        });

        return res.status(200).json({
          error: false,
          message: "Upload realizado com sucesso",
          clienteId: clienteDoc._id,
          foto: arquivosDocs[0].caminhoArquivo,
        });

      } catch (err) {

        console.error("Erro upload cliente:", err);

        return res.status(500).json({
          error: true,
          message: err.message,
        });

      }

    });

    req.pipe(busboy);

  } catch (err) {

    console.error("Erro geral upload cliente:", err);

    return res.status(500).json({
      error: true,
      message: "Erro interno no upload",
    });

  }
});
module.exports = router;