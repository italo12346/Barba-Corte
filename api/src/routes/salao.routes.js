const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Salao = require("../models/salao");
const Servicos = require("../models/servico");

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
