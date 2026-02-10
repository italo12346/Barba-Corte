app.post("/mp/pix", async (req, res) => {
  try {
    const pagamento = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      {
        transaction_amount: 10,
        description: "Teste Barbearia",
        payment_method_id: "pix",
        payer: {
          email: "teste@barba.com"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    res.json({
      status: pagamento.data.status,
      qr_code: pagamento.data.point_of_interaction.transaction_data.qr_code,
      qr_base64:
        pagamento.data.point_of_interaction.transaction_data.qr_code_base64
    });

  } catch (err) {
    console.error(err.response?.data);
    res.status(500).send("Erro ao criar PIX");
  }
});
