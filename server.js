const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());

// Load config from environment variables (with defaults)
const apiKey = process.env.POCKET_API_KEY;
const salt = process.env.POCKET_SALT;
const pocketApiUrl = process.env.POCKET_API_URL || 'https://pay.threeg.asia/payments/create';
const returnUrl = process.env.RETURN_URL || 'https://jom-jalan-taxi-brunei-services.onrender.com/thank-you';
const callbackUrl = process.env.CALLBACK_URL || 'https://jom-jalan-taxi-brunei-services.onrender.com/payment-callback';
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Payment callback route (Pocket will notify here)
app.post('/payment-callback', (req, res) => {
  console.log('📩 Payment callback received:', req.body);
  res.sendStatus(200);
});

// Create Pocket payment route
app.post('/create-pocket-payment', async (req, res) => {
  try {
    const orderId = Math.floor(10000 + Math.random() * 90000);

    const payload = {
      api_key: apiKey,
      salt: salt,
      amount: req.body.amount || 100,
      order_id: orderId,
      order_info: `Booking Order #${orderId}`,
      order_desc: "Taxi / Tour Booking",
      return_url: returnUrl,
      callback_url: callbackUrl,
      subamount_1: req.body.amount || 100,
      subamount_1_label: "Total Booking",
      discount: 0
    };

    const response = await axios.post(pocketApiUrl, payload, {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚕 Server running on port ${PORT}`);
});
