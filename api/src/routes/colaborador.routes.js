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
  console.log("======================================");
  console.log("🚀 INICIANDO CRIAÇÃO DE COLABORADOR");
  console.log("BODY:", JSON.stringify(req.body, null, 2));

  const db = mongoose.connection;
  const session = await db.startSession();

  try {
    await session.startTransaction();

    const { colaborador, salaoId } = req.body;

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
/*
========================
LISTAR POR SALÃO
========================
*/
router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;

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
