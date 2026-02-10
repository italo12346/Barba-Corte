const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const mercadoPago = axios.create({
  baseURL: "https://api.mercadopago.com",
  headers: {
    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  }
});

// services/mercadopago.js

async function criarPixPagamento({ valor, descricao, email }) {
  const pagamento = await mercadoPago.post(
    "/v1/payments",
    {
      transaction_amount: valor,
      description: descricao,
      payment_method_id: "pix",
      payer: { email }
    },
    {
      headers: {
        "X-Idempotency-Key": uuidv4()
      }
    }
  );

  return pagamento.data;
}

async function buscarPagamento(paymentId) {
  const response = await mercadoPago.get(`/v1/payments/${paymentId}`);
  return response.data;
}

module.exports = {
  criarPixPagamento,
  buscarPagamento
};
