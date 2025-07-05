const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

// GET / — prevent "Cannot GET /" on Render
app.get('/', (req, res) => {
  res.send('API is running. Use POST /create-pocket-payment');
});

// POST /create-pocket-payment — Pocket API integration
app.post('/create-pocket-payment', async (req, res) => {
  try {
    const orderId = Math.floor(10000 + Math.random() * 90000); // random order_id

    const payload = {
      api_key: "XnUgH1PyIZ8p1iF2IbKUiOBzdrLPNnWq",
      salt: "FOLzaoJSdbgaNiVVA73vGiIR7yovZury4OdOalPFoWTdKmDVxfoJCJYTs4nhUFS2",
      amount: req.body.amount || 100,
      subamount_1: req.body.amount || 100,
      subamount_1_label: "Order Total",
      subamount_2: 0,
      subamount_3: 0,
      subamount_4: 0,
      subamount_5: 0,
      order_id: orderId,
      order_info: `Order Info ${orderId}`,
      order_desc: "Test Description",
      return_url: "https://www.threegmedia.com/",
      callback_url: "http://pocket-api.threeg.asia/callbase",
      discount: 0
    };

    const response = await axios.post("http://pay.threeg.asia/payments/getNewOrderId", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    const redirectUrl = response.data?.data?.redirect_url;

    if (!redirectUrl) {
      return res.status(400).json({
        error: "No redirect URL returned from Pocket Pay",
        details: response.data
      });
    }

    res.json({ redirectUrl });

  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Pocket Pay request failed",
      details: error.response?.data || error.message
    });
  }
});

// Start server on Render-assigned port or 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});