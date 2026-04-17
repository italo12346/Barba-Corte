// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Não autorizado" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.salaoId = decoded.id; // disponível em todas as rotas protegidas
    next();
  } catch {
    return res.status(401).json({ error: true, message: "Token inválido ou expirado" });
  }
};
