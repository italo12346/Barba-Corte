const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
    data ? JSON.stringify(data, null, 2) : ""
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
      $or: [
        { email: cliente.email },
        { telefone: cliente.telefone },
      ],
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
      .filter(c => c.clienteId)
      .map(c => ({
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

module.exports = router;
