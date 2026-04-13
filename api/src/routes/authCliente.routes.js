const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const Cliente = require("../models/cliente");

const JWT_SECRET  = process.env.JWT_SECRET  || "sua_chave_secreta_aqui";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/* ===============================
   REGISTRO
=============================== */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, telefone, dataNascimento, sexo, documento, endereco } = req.body;

    if (!nome || !email || !senha || !documento?.tipo || !documento?.numero) {
      return res.status(400).json({
        error: true,
        message: "Preencha todos os campos obrigatórios",
      });
    }

    const jaExiste = await Cliente.findOne({
      $or: [
        { email },
        { "documento.numero": documento.numero },
      ],
    });

    if (jaExiste) {
      return res.status(400).json({
        error: true,
        message: jaExiste.email === email
          ? "E-mail já cadastrado"
          : "Documento já cadastrado",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const cliente = await new Cliente({
      nome,
      email,
      senha: senhaHash,
      telefone,
      dataNascimento,
      sexo,
      documento,
      endereco,
      status: "ATIVO",
    }).save();

    const token = jwt.sign({ id: cliente._id, tipo: "cliente" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.status(201).json({
      error: false,
      token,
      cliente: {
        _id:            cliente._id,
        nome:           cliente.nome,
        email:          cliente.email,
        foto:           cliente.foto    || null,
        telefone:       cliente.telefone || null,
        dataNascimento: cliente.dataNascimento || null,
        sexo:           cliente.sexo    || null,
        documento:      cliente.documento,
        endereco:       cliente.endereco || null,
        status:         cliente.status,
      },
    });
  } catch (err) {
    console.error("Erro no registro do cliente:", err);
    res.status(500).json({ error: true, message: "Erro ao registrar cliente" });
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

    const cliente = await Cliente.findOne({ email });
    if (!cliente) {
      return res.status(401).json({
        error: true,
        message: "E-mail ou senha inválidos",
      });
    }

    if (cliente.status === "INATIVO") {
      return res.status(403).json({
        error: true,
        message: "Conta inativa. Entre em contato com o suporte.",
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, cliente.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        error: true,
        message: "E-mail ou senha inválidos",
      });
    }

    const token = jwt.sign({ id: cliente._id, tipo: "cliente" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.json({
      error: false,
      token,
      cliente: {
        _id:            cliente._id,
        nome:           cliente.nome,
        email:          cliente.email,
        foto:           cliente.foto           || null,
        telefone:       cliente.telefone        || null,
        dataNascimento: cliente.dataNascimento  || null,
        sexo:           cliente.sexo            || null,
        documento:      cliente.documento,
        endereco:       cliente.endereco        || null,
        status:         cliente.status,
      },
    });
  } catch (err) {
    console.error("Erro no login do cliente:", err);
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
      return res.status(401).json({ error: true, message: "Token não informado" });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const cliente = await Cliente.findById(decoded.id).select("-senha");
    if (!cliente) {
      return res.status(401).json({ error: true, message: "Cliente não encontrado" });
    }

    return res.json({ error: false, cliente });
  } catch (err) {
    res.status(401).json({ error: true, message: "Token inválido ou expirado" });
  }
});


/* ===============================
   LOGIN COM GOOGLE
=============================== */
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: true, message: "Token não informado" });
    }

    // ── Verifica o token com o Google ────────────────────────────────────
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // ── Busca ou cria o cliente ──────────────────────────────────────────
    let cliente = await Cliente.findOne({ email });

    if (!cliente) {
      // Cria cliente sem senha (login social)
      cliente = await new Cliente({
        nome:      name,
        email,
        senha:     await bcrypt.hash(googleId, 10), // senha aleatória, nunca usada
        foto:      picture || null,
        status:    "ATIVO",
        documento: { tipo: "CPF", numero: `GOOGLE_${googleId}` }, // placeholder
      }).save();
    }

    if (cliente.status === "INATIVO") {
      return res.status(403).json({
        error: true,
        message: "Conta inativa. Entre em contato com o suporte.",
      });
    }

    const token = jwt.sign({ id: cliente._id, tipo: "cliente" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    return res.json({
      error: false,
      token,
      cliente: {
        _id:            cliente._id,
        nome:           cliente.nome,
        email:          cliente.email,
        foto:           cliente.foto           || null,
        telefone:       cliente.telefone        || null,
        dataNascimento: cliente.dataNascimento  || null,
        sexo:           cliente.sexo            || null,
        documento:      cliente.documento,
        endereco:       cliente.endereco        || null,
        status:         cliente.status,
      },
    });
  } catch (err) {
    console.error("Erro no login Google:", err);
    res.status(500).json({ error: true, message: "Erro ao autenticar com Google" });
  }
});

module.exports = router;