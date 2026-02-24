const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Busboy = require("busboy");

const Cliente = require("../models/cliente");
const SalaoCliente = require("../models/relationship/salaoCliente");
const moment = require("moment");

/*
========================================
DEBUG HELPER
========================================
*/
const debug = (scope, message, data = null) => {
  console.log(
    `[DEBUG][${scope}] ${message}`,
    data ? JSON.stringify(data, null, 2) : "",
  );
};

/*
========================================
CRIAR / VINCULAR CLIENTE AO SALÃO
========================================
*/
router.post("/", async (req, res) => {
  const txId = new mongoose.Types.ObjectId().toString();
  debug(txId, "Iniciando criação/vínculo", req.body);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cliente, salaoId } = req.body;

    if (!cliente || !salaoId) {
      throw new Error("Dados incompletos");
    }

    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
      throw new Error("ID do salão inválido");
    }

    debug(txId, "Validando cliente existente");

    let existentClient = await Cliente.findOne({
      $or: [{ email: cliente.email }, { telefone: cliente.telefone }],
    }).session(session);

    let clienteId;

    if (!existentClient) {
      debug(txId, "Cliente não existe — criando");

      const novoCliente = await new Cliente({
        ...cliente,
        mercadoPago: {
          customerId: null,
        },
      }).save({ session });

      clienteId = novoCliente._id;
    } else {
      debug(txId, "Cliente existente encontrado", existentClient._id);
      clienteId = existentClient._id;
    }

    debug(txId, "Verificando vínculo salão ⇄ cliente");

    let vinculo = await SalaoCliente.findOne({
      salaoId,
      clienteId,
    }).session(session);

    if (!vinculo) {
      debug(txId, "Criando novo vínculo");

      await new SalaoCliente({
        salaoId,
        clienteId,
        status: "A",
      }).save({ session });
    } else if (vinculo.status === "I") {
      debug(txId, "Reativando vínculo");

      vinculo.status = "A";
      await vinculo.save({ session });
    }

    await session.commitTransaction();
    debug(txId, "Transação concluída com sucesso");

    return res.json({
      error: false,
      clienteId,
    });
  } catch (err) {
    debug(txId, "Erro na transação", err.message);

    await session.abortTransaction();

    return res.status(400).json({
      error: true,
      message: err.message,
    });
  } finally {
    session.endSession();
    debug(txId, "Sessão encerrada");
  }
});

/*
========================================
FILTRAR CLIENTES
========================================
*/
router.post("/filter", async (req, res) => {
  const scope = "FILTER";

  try {
    debug(scope, "Filtro recebido", req.body.filters);

    const clientes = await Cliente.find(req.body.filters || {});

    debug(scope, "Clientes encontrados", clientes.length);

    res.json({
      error: false,
      clientes,
    });
  } catch (err) {
    debug(scope, "Erro no filtro", err.message);

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
  const scope = "LIST";

  try {
    const { salaoId } = req.params;
    debug(scope, "Listando clientes do salão", salaoId);

    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
      throw new Error("ID do salão inválido");
    }

    const clientes = await SalaoCliente.find({
      salaoId,
      status: "A",
    })
      .populate("clienteId")
      .select("clienteId dataCadastro");

    debug(scope, "Vínculos encontrados", clientes.length);

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
    debug(scope, "Erro na listagem", err.message);

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
  const scope = "DELETE";

  try {
    const { id } = req.params;
    debug(scope, "Inativando vínculo", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const vinculo = await SalaoCliente.findById(id);

    if (!vinculo) {
      throw new Error("Vínculo não encontrado");
    }

    vinculo.status = "I";
    await vinculo.save();

    debug(scope, "Vínculo inativado");

    res.json({ error: false });
  } catch (err) {
    debug(scope, "Erro ao inativar", err.message);

    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});
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
    =========================================
    CAPTURA DOS CAMPOS
    =========================================
    */
    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    /*
    =========================================
    CAPTURA DO ARQUIVO
    =========================================
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
    =========================================
    FINALIZAÇÃO
    =========================================
    */
    busboy.on("finish", async () => {
      try {
        let { cliente, salaoId, clienteId } = fields;

        console.log("📦 FIELDS:", fields);

        if (typeof cliente === "string") {
          cliente = JSON.parse(cliente);
        }

        const files = await Promise.all(filePromises);

        console.log("📁 FILES:", files.length);

        let clienteDoc;

        /*
        =========================================
        CREATE
        =========================================
        */
        if (!clienteId) {
          if (!cliente || !salaoId) {
            throw new Error("Dados incompletos");
          }

          clienteDoc = await Cliente.create({
            ...cliente,
            foto: null,
            mercadoPago: {
              customerId: null,
            },
          });

          await SalaoCliente.create({
            salaoId,
            clienteId: clienteDoc._id,
            status: "A",
          });
        } else {
          /*
        =========================================
        UPDATE
        =========================================
        */
          if (!mongoose.Types.ObjectId.isValid(clienteId)) {
            throw new Error("ID inválido");
          }

          clienteDoc = await Cliente.findById(clienteId);

          if (!clienteDoc) {
            throw new Error("Cliente não encontrado");
          }
        }

        /*
        =========================================
        SE NÃO TEM ARQUIVO → SÓ CRIA
        =========================================
        */
        if (!files.length) {
          return res.json({
            error: false,
            clienteId: clienteDoc._id,
            message: "Cliente criado sem foto",
          });
        }

        /*
        =========================================
        REMOVE FOTO ANTIGA
        =========================================
        */
        const antigos = await Arquivos.find({
          referenciaId: clienteDoc._id,
          model: "Cliente",
        });

        for (const arq of antigos) {
          await awsService.deleteFromS3(arq.caminhoArquivo);
          await arq.deleteOne();
        }

        /*
        =========================================
        UPLOAD S3
        =========================================
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
            f.mimeType,
          );

          console.log("☁️ UPLOAD RESULT:", upload);

          if (upload.error) {
            throw new Error(upload.message);
          }

          arquivosDocs.push({
            referenciaId: clienteDoc._id,
            model: "Cliente",
            nome: f.filename,
            caminhoArquivo: `${process.env.S3_BUCKET}/${key}`,
            tipoMime: f.mimeType,
            tamanho: f.tamanho,
          });
        }

        await Arquivos.insertMany(arquivosDocs);

        /*
        =========================================
        ATUALIZA FOTO NO CLIENTE
        =========================================
        */
        await Cliente.findByIdAndUpdate(clienteDoc._id, {
          foto: arquivosDocs[0].caminhoArquivo,
        });

        return res.status(200).json({
          error: false,
          message: "Cliente criado/atualizado com sucesso",
          clienteId: clienteDoc._id,
          foto: arquivosDocs[0].caminhoArquivo,
        });
      } catch (err) {
        console.error("💥 ERRO INTERNO UPLOAD CLIENTE:");
        console.error(err);

        return res.status(500).json({
          error: true,
          message: err.message,
        });
      }
    });

    req.pipe(busboy);
  } catch (err) {
    console.error("💥 ERRO GERAL:");
    console.error(err);

    return res.status(500).json({
      error: true,
      message: "Erro interno no upload",
    });
  }
});
module.exports = router;
