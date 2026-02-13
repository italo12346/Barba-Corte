const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Cliente = require("../models/cliente");
const SalaoCliente = require("../models/relationship/salaoCliente");

const moment = require("moment");

/*
========================================
CRIAR / VINCULAR CLIENTE AO SALÃO
========================================
*/
router.post("/", async (req, res) => {
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

    // 🔍 procura cliente existente
    let existentClient = await Cliente.findOne({
      $or: [
        { email: cliente.email },
        { telefone: cliente.telefone },
      ],
    }).session(session);

    let clienteId;

    /*
    =====================
    CRIAR CLIENTE
    =====================
    */
    if (!existentClient) {
      const novoCliente = await new Cliente({
        ...cliente,
        mercadoPago: {
          customerId: null,
        },
      }).save({ session });

      clienteId = novoCliente._id;

    } else {
      clienteId = existentClient._id;
    }

    /*
    =====================
    VÍNCULO SALÃO ⇄ CLIENTE
    =====================
    */
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
router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(salaoId)) {
      throw new Error("ID do salão inválido");
    }

    const clientes = await SalaoCliente.find({
      salaoId,
      status: "A",
    })
      .populate("clienteId")
      .select("clienteId dataCadastro");

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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const vinculo = await SalaoCliente.findById(id);

    if (!vinculo) {
      throw new Error("Vínculo não encontrado");
    }

    vinculo.status = "I";
    await vinculo.save();

    res.json({
      error: false,
    });

  } catch (err) {
    res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

module.exports = router;
