const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

// ✅ Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Pocket Pay callback (optional logging)
app.post('/payment-callback', (req, res) => {
  console.log('📩 Payment callback received:', req.body);
  res.sendStatus(200);
});

// ✅ Create Pocket payment using /payments/create
app.post('/create-pocket-payment', async (req, res) => {
  try {
    const orderId = Math.floor(10000 + Math.random() * 90000);

    const payload = {
      api_key: "XnUgH1PyIZ8p1iF2IbKUiOBzdrLPNnWq",
      salt: "FOLzaoJSdbgaNiVVA73vGiIR7yovZury4OdOalPFoWTdKmDVxfoJCJYTs4nhUFS2",
      amount: req.body.amount || 100,
      order_id: orderId,
      order_info: `Booking Order #${orderId}`,
      order_desc: "Taxi / Tour Booking",
      return_url: "https://jom-jalan-taxi-brunei-services.onrender.com/thank-you",
      callback_url: "https://jom-jalan-taxi-brunei-services.onrender.com/payment-callback",
      subamount_1: req.body.amount || 100,
      subamount_1_label: "Total Booking",
      discount: 0
    };

    const response = await axios.post("https://pay.threeg.asia/payments/create", payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });

    const { payment_url, order_ref, success_indicator, qr } = response.data?.data || {};

    if (!payment_url) {
      return res.status(400).json({
        error: "Payment URL not returned",
        details: response.data
      });
    }

    res.json({ payment_url, order_ref, success_indicator, qr });

  } catch (error) {
    console.error("❌ Pocket Pay error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Pocket Pay request failed",
      details: error.response?.data || error.message
    });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚕 Server running on port ${PORT}`);
});
