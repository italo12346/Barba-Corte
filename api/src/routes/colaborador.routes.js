const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");

const router = express.Router();

const Colaborador = require("../models/colaborador");
const SalaoColaborador = require("../models/relationship/salaoColaborador");
const ColaboradorServico = require("../models/relationship/colaboradorServico");


/*
========================================
CRIAR COLABORADOR + VÍNCULO + SERVIÇOS
========================================
*/
router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { colaborador, salaoId } = req.body;
    let newColaborador = null;

    // 🔍 verifica se já existe
    const existentColaborador = await Colaborador.findOne({
      $or: [
        { email: colaborador.email },
        { telefone: colaborador.telefone },
      ],
    });

    let colaboradorId;

    if (!existentColaborador) {
      newColaborador = await new Colaborador({
        ...colaborador,
      }).save({ session });

      colaboradorId = newColaborador._id;
    } else {
      colaboradorId = existentColaborador._id;
    }

    // 🔗 vínculo com salão
    const existentRelationship = await SalaoColaborador.findOne({
      salaoId,
      colaboradorId,
    });

    if (!existentRelationship) {
      await new SalaoColaborador({
        salaoId,
        colaboradorId,
        status: colaborador.vinculo || "A",
      }).save({ session });
    }

    if (existentRelationship && existentRelationship.status === "I") {
      await SalaoColaborador.findOneAndUpdate(
        { salaoId, colaboradorId },
        { status: "A" },
        { session }
      );
    }

    // 🛠 especialidades
    if (colaborador.especialidades?.length) {
      await ColaboradorServico.insertMany(
        colaborador.especialidades.map((servicoId) => ({
          servicoId,
          colaboradorId,
        })),
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ error: false });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Erro criar colaborador:", err);

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
router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;
    let listaColaboradores = [];

    const colaboradores = await SalaoColaborador.find({
      salaoId,
      status: { $ne: "E" },
    })
      .populate("colaboradorId")
      .select("colaboradorId dataCadastro status");

    for (let colaborador of colaboradores) {
      const especialidades = await ColaboradorServico.find({
        colaboradorId: colaborador.colaboradorId._id,
      });

      listaColaboradores.push({
        ...colaborador._doc,
        especialidades: especialidades.map((e) => e.servicoId),
      });
    }

    res.json({
      error: false,
      colaboradores: listaColaboradores.map((c) => ({
        ...c.colaboradorId._doc,
        vinculoId: c._id,
        vinculo: c.status,
        especialidades: c.especialidades,
        dataCadastro: moment(c.dataCadastro).format("DD/MM/YYYY"),
      })),
    });

  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

/*
====================
ATUALIZAR
====================
*/
router.put("/:colaboradorId", async (req, res) => {
  try {
    const { vinculo, vinculoId, especialidades } = req.body;
    const { colaboradorId } = req.params;

    await Colaborador.findByIdAndUpdate(colaboradorId, req.body);

    if (vinculo) {
      await SalaoColaborador.findByIdAndUpdate(vinculoId, {
        status: vinculo,
      });
    }

    if (especialidades) {
      await ColaboradorServico.deleteMany({ colaboradorId });

      await ColaboradorServico.insertMany(
        especialidades.map((servicoId) => ({
          servicoId,
          colaboradorId,
        }))
      );
    }

    res.json({ error: false });

  } catch (err) {
    res.json({ error: true, message: err.message });
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

module.exports = router;
