// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const Salao = require("../models/salao");

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_aqui";
const JWT_EXPIRES = "7d";

/* ===============================
   REGISTRO
=============================== */

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco } = req.body;

    if (!nome || !email || !senha || !telefone) {
      return res.status(400).json({
        error: true,
        message: "Preencha todos os campos obrigatórios",
      });
    }

    const jaExiste = await Salao.findOne({ email });
    if (jaExiste) {
      return res.status(400).json({
        error: true,
        message: "E-mail já cadastrado",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const salao = await new Salao({
      nome,
      email,
      senha: senhaHash,
      telefone,
      endereco,
      geo: { type: "Point", coordinates: [0, 0] }, // ✅ evita erro do índice 2dsphere
    }).save();

    const token = jwt.sign({ id: salao._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({
      error: false,
      token,
      salao: {
        _id: salao._id,
        nome: salao.nome,
        email: salao.email,
      },
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ error: true, message: "Erro ao registrar salão" });
  }
});

/* ===============================
   LOGIN
=============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: true,
        message: "Informe e-mail e senha",
      });
    }

    const salao = await Salao.findOne({ email });
    if (!salao) {
      return res.status(401).json({
        error: true,
        message: "E-mail ou senha inválidos",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, salao.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        error: true,
        message: "E-mail ou senha inválidos",
      });
    }

    const token = jwt.sign({ id: salao._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.json({
      error: false,
      token,
      salao: {
        _id: salao._id,
        nome: salao.nome,
        email: salao.email,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: true, message: "Erro ao fazer login" });
  }
});

/* ===============================
   VERIFICAR TOKEN
=============================== */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: true, message: "Token não informado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const salao = await Salao.findById(decoded.id).select("-senha");
    if (!salao) {
      return res
        .status(401)
        .json({ error: true, message: "Salão não encontrado" });
    }

    res.json({ error: false, salao });
  } catch (err) {
    res
      .status(401)
      .json({ error: true, message: "Token inválido ou expirado" });
  }
});

module.exports = router;
